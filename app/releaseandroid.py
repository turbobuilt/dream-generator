from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

package_name = 'ai.dreamgenerator.apptwo' # Your app's package name
aab_file_path = 'build/app/outputs/bundle/release/app-release.aab' # Path to your .aab file
service_account_file = 'googlepublish.json' # Path to your service account key file

# Authenticate with the service account
credentials = service_account.Credentials.from_service_account_file(service_account_file)

# Build a client to the Play Developer API
androidpublisher = build('androidpublisher', 'v3', credentials=credentials)

# Specify the edit request details
edit_request = androidpublisher.edits().insert(body={}, packageName=package_name)
result = edit_request.execute()
edit_id = result['id']

# Upload the app bundle
print("uploading...")
aab = MediaFileUpload(aab_file_path, mimetype='application/octet-stream')
upload_response = androidpublisher.edits().bundles().upload(
    uploadType='media',
    packageName=package_name,
    editId=edit_id,
    media_body=aab
).execute()

# Assign the app bundle to the release track
track_response = androidpublisher.edits().tracks().update(
    body={'releases': [{'versionCodes': [upload_response['versionCode']], 'status': 'draft'}]},
    packageName=package_name,
    editId=edit_id,
    track='production',
).execute()

# Commit the edit to begin review process
commit_request = androidpublisher.edits().commit(
    packageName=package_name,
    editId=edit_id,
).execute()

print(f"Success! Uploaded version code {upload_response['versionCode']} and committed to the {track_response['track']} track.")