import requests
import sys
import json


def check_server_status():
    """Check if the Django server is running and accessible."""
    try:
        response = requests.get("http://localhost:8000/health/")
        if response.status_code == 200:
            print("✅ Django server is running!")
            return True
        else:
            print(f"❌ Django server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server at http://localhost:8000")
        print("   Make sure the server is running with: python manage.py runserver")
        return False


def check_api_root():
    """Check if the API root is accessible."""
    try:
        response = requests.get("http://localhost:8000/api/")
        if response.status_code == 200:
            print("✅ API root is accessible!")
            data = response.json()
            print("\nAvailable endpoints:")
            print(json.dumps(data, indent=2))
            return True
        else:
            print(f"❌ API root returned status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API root")
        return False


def check_resource_management():
    """Check if the resource management API is accessible."""
    urls_to_check = [
        "/api/resource-management/",
        "/api/resource-management/suppliers/",
        "/api/resource-management/test/",
    ]

    success = False

    for url in urls_to_check:
        full_url = f"http://localhost:8000{url}"
        try:
            print(f"\nChecking: {full_url}")
            response = requests.get(full_url)
            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                print("✅ Endpoint is accessible!")
                try:
                    data = response.json()
                    print("Response data:")
                    print(json.dumps(data, indent=2)[:500])  # Limit output size
                    success = True
                except json.JSONDecodeError:
                    print("Response is not JSON. First 200 characters:")
                    print(response.text[:200])
            else:
                print(f"❌ Endpoint returned status code: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to {full_url}")

    return success


def check_authentication():
    """Check if authentication endpoints are working."""
    print("\nChecking authentication endpoints...")
    try:
        response = requests.post(
            "http://localhost:8000/api/token/",
            json={"email": "test@example.com", "password": "testpass123"},
        )
        if response.status_code == 200:
            print("✅ Authentication endpoint is working!")
            data = response.json()
            print("Token received!")
            return data.get("access")
        else:
            print(f"❌ Authentication failed with status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to authentication endpoint")
        return None


def check_authenticated_endpoint(token):
    """Check if we can access an authenticated endpoint."""
    if not token:
        print("\n❌ Skipping authenticated endpoint check (no token)")
        return False

    print("\nChecking authenticated access to suppliers endpoint...")
    try:
        response = requests.get(
            "http://localhost:8000/api/resource-management/suppliers/",
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code == 200:
            print("✅ Successfully accessed suppliers with authentication!")
            data = response.json()
            print("Response data:")
            print(json.dumps(data, indent=2)[:500])  # Limit output size
            return True
        else:
            print(
                f"❌ Authenticated access failed with status code: {response.status_code}"
            )
            print(f"   Response: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to suppliers endpoint")
        return False


if __name__ == "__main__":
    print("Django Server Connection Checker")
    print("===============================\n")

    if not check_server_status():
        print("\n❌ Cannot proceed: Django server is not accessible")
        sys.exit(1)

    check_api_root()
    check_resource_management()
    token = check_authentication()
    check_authenticated_endpoint(token)

    print("\nDiagnostic check complete!")
