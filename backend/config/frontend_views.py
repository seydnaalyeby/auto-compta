from pathlib import Path

from django.conf import settings
from django.http import Http404
from django.shortcuts import render


def react_app(request):
    index_path = Path(settings.TEMPLATES[0]['DIRS'][0]) / 'index.html'
    if not index_path.exists():
        raise Http404('React build not found. Run "npm run build" inside the web folder.')
    return render(request, 'index.html')
