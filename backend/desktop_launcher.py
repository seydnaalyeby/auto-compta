import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def main():
    backend_dir = Path(__file__).resolve().parent
    if getattr(sys, 'frozen', False):
        executable_dir = Path(sys.executable).resolve().parent
        web_build_dir = executable_dir.parent / 'web' / 'build'
    else:
        web_build_dir = backend_dir.parent / 'web' / 'build'
    data_dir = Path(
        os.getenv(
            'AUTO_COMPTA_DESKTOP_DATA_DIR',
            Path.home() / 'AppData' / 'Local' / 'AutoCompta',
        )
    )
    data_dir.mkdir(parents=True, exist_ok=True)

    env_candidates = [
        backend_dir / '.env.desktop',
        backend_dir / '.env',
        data_dir / '.env',
    ]
    if getattr(sys, 'frozen', False):
        executable_dir = Path(sys.executable).resolve().parent
        env_candidates = [
            executable_dir / '.env.desktop',
            executable_dir / '.env',
            *env_candidates,
        ]

    for env_file in env_candidates:
        if env_file.exists():
            load_dotenv(env_file, override=False)

    os.chdir(backend_dir)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    os.environ.setdefault('APP_MODE', 'desktop')
    os.environ.setdefault('DB_ENGINE', 'sqlite')
    os.environ.setdefault('AUTO_COMPTA_DESKTOP_DATA_DIR', str(data_dir))
    os.environ.setdefault('AUTO_COMPTA_WEB_BUILD_DIR', str(web_build_dir))
    os.environ.setdefault('DEBUG', 'True')

    import django
    from django.core.management import call_command

    django.setup()
    call_command('migrate', interactive=False, run_syncdb=True)
    call_command('runserver', '127.0.0.1:8000', '--noreload')


if __name__ == '__main__':
    main()
