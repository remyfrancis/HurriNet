import requests
import json


def test_api_endpoints():
    """Test various API endpoints to find the correct one."""
    base_url = "http://localhost:8000"
    endpoints = [
        "/resource_management/suppliers/",
        "/api/resource_management/suppliers/",
        "/api/resource-management/suppliers/",
        "/api/suppliers/",
        "/suppliers/",
        "/resource_management/api/suppliers/",
        "/api/v1/resource_management/suppliers/",
        "/api/v1/suppliers/",
    ]

    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\nTesting API endpoint: {url}")

        try:
            response = requests.get(url)
            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print("Success! Response data:")
                print(json.dumps(data, indent=2))
            else:
                print(f"Error: {response.status_code}")
                print(
                    response.text[:200] + "..."
                    if len(response.text) > 200
                    else response.text
                )
        except Exception as e:
            print(f"Exception: {e}")


def test_api_info():
    """Test the API root to get information about available endpoints."""
    url = "http://localhost:8000/api/"
    print(f"\nTesting API root: {url}")

    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("Available API endpoints:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(
                response.text[:200] + "..."
                if len(response.text) > 200
                else response.text
            )
    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":
    test_api_endpoints()
    test_api_info()
