import requests
import json
import sys


def get_auth_token():
    """Get an authentication token from the API."""
    print("Attempting to get authentication token...")

    try:
        response = requests.post(
            "http://localhost:8000/api/token/",
            json={"email": "resource@hurrinet.org", "password": "Resource!123"},
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get("access")
            print("✅ Successfully obtained authentication token")
            return token
        else:
            print(f"❌ Failed to get token. Status code: {response.status_code}")
            print(f"Response: {response.text[:200]}")

            # Try with username instead of email
            print("\nTrying with username instead of email...")
            response = requests.post(
                "http://localhost:8000/api/token/",
                json={"username": "test@example.com", "password": "testpass123"},
            )

            if response.status_code == 200:
                data = response.json()
                token = data.get("access")
                print("✅ Successfully obtained authentication token using username")
                return token
            else:
                print(
                    f"❌ Failed to get token with username. Status code: {response.status_code}"
                )
                print(f"Response: {response.text[:200]}")
                return None
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to authentication endpoint")
        return None


def test_suppliers_endpoint(token=None):
    """Test the suppliers endpoint with authentication if token is provided."""
    print("\nTesting suppliers endpoint...")

    # URLs to try
    urls = [
        "http://localhost:8000/api/resource-management/suppliers/",
        "http://localhost:8000/resource-management/suppliers/",
        "http://localhost:8000/api/resource_management/suppliers/",
    ]

    for url in urls:
        print(f"\nTrying URL: {url}")

        # First try without authentication
        try:
            print("Without authentication:")
            response = requests.get(url)
            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print("Response data:")
                print(json.dumps(data, indent=2)[:500])
            else:
                print(f"Response: {response.text[:200]}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to {url}")
            continue

        # Then try with authentication if token is provided
        if token:
            try:
                print("\nWith authentication:")
                response = requests.get(
                    url, headers={"Authorization": f"Bearer {token}"}
                )
                print(f"Status code: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    print("Response data:")
                    print(json.dumps(data, indent=2)[:500])
                else:
                    print(f"Response: {response.text[:200]}")
            except requests.exceptions.ConnectionError:
                print(f"❌ Cannot connect to {url} with authentication")


def test_api_test_endpoint():
    """Test the API test endpoint which should be accessible without authentication."""
    print("\nTesting API test endpoint...")

    url = "http://localhost:8000/api/resource-management/test/"

    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("Response data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Response: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {url}")


if __name__ == "__main__":
    print("Supplier API Endpoint Tester")
    print("===========================\n")

    # Test the API test endpoint first (should work without authentication)
    test_api_test_endpoint()

    # Get authentication token
    token = get_auth_token()

    # Test suppliers endpoint
    test_suppliers_endpoint(token)

    print("\nTest complete!")
