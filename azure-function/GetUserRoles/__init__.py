import logging
import json
import base64
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Azure Function to map Entra ID (Azure AD) group membership to application roles.

    This function reads the x-ms-client-principal header provided by Azure Static Web Apps,
    extracts group claims, and maps them to application roles for the BattenSpace dashboard.

    Groups:
    - FBS_StaffAll: Batten School staff members
    - FBS_Community: Batten School community members

    Both groups receive 'authenticated' role with full read-only dashboard access.
    """
    logging.info('GetUserRoles function triggered')

    # Get the user claims from the x-ms-client-principal header
    # This header is automatically added by Azure Static Web Apps after authentication
    client_principal_header = req.headers.get('x-ms-client-principal')

    if not client_principal_header:
        logging.warning('No x-ms-client-principal header found')
        return func.HttpResponse(
            json.dumps({"roles": []}),
            mimetype="application/json",
            status_code=200
        )

    try:
        # Decode the base64 encoded header
        claims_data = base64.b64decode(client_principal_header).decode('utf-8')
        claims = json.loads(claims_data)

        # Extract user information
        user_id = claims.get('userId', 'unknown')
        user_details = claims.get('userDetails', 'unknown')
        logging.info(f'Processing roles for user: {user_details} (ID: {user_id})')

        # Extract user roles/groups from claims
        user_roles = []
        user_claims = claims.get('claims', [])

        # Track which groups the user belongs to for logging
        found_groups = []

        # Look for group claims (roles claim type contains group names when configured)
        for claim in user_claims:
            claim_type = claim.get('typ', '')
            claim_value = claim.get('val', '')

            # Azure AD emits groups as role claims when configured
            if claim_type == 'roles' or claim_type == 'groups':
                found_groups.append(claim_value)

                # Map FBS groups to application roles
                if claim_value == 'FBS_StaffAll':
                    if 'staff' not in user_roles:
                        user_roles.append('staff')
                        logging.info(f'User {user_details} mapped to staff role')

                elif claim_value == 'FBS_Community':
                    if 'community' not in user_roles:
                        user_roles.append('community')
                        logging.info(f'User {user_details} mapped to community role')

        # Add authenticated role for all users who successfully logged in
        if 'authenticated' not in user_roles:
            user_roles.append('authenticated')

        # Log group membership
        if found_groups:
            logging.info(f'User groups found: {", ".join(found_groups)}')
        else:
            logging.warning(f'No FBS groups found for user {user_details}')

        response_data = {
            "roles": user_roles
        }

        logging.info(f'Final roles for {user_details}: {user_roles}')

        return func.HttpResponse(
            json.dumps(response_data),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f'Error processing user roles: {str(e)}', exc_info=True)
        # Return authenticated role as fallback to allow access
        return func.HttpResponse(
            json.dumps({"roles": ["authenticated"]}),
            mimetype="application/json",
            status_code=200
        )
