import os
import sys
from pathlib import Path


def main():
    # Add the project root to Python path
    project_root = Path(__file__).resolve().parent
    sys.path.append(str(project_root))

    # Set the Django settings module
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hurrinet.settings")

    # Start Daphne
    from daphne.cli import CommandLineInterface

    CommandLineInterface().run(
        ["-b", "0.0.0.0", "-p", "8000", "hurrinet.asgi:application"]
    )


if __name__ == "__main__":
    main()
