from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.core import serializers
from django.core.serializers import serialize
from django.http import JsonResponse
from django.forms.models import model_to_dict
from movies.models import Movies
import json


def index(request):
		#return HttpResponse("Hello, world. You're at the Nutter Movie Viewer.")
		#template = loader.get_template('movies/index.html')
		#return HttpResponse(template.render())
		
		movies = Movies.objects.all().order_by('title', 'release_date')
		for movie in movies:
				url = movie.poster_image
				if movie.poster_image != None and movie.poster_image != 'N/A':
						filename = url[url.rfind("/")+1:]
						movie.poster_image = filename
				else:
						movie.poster_image = url
		context = {
				'movies': movies
		}

		return render(request, 'movies/index.html', context)

		
def get_movies(request):
		movies = Movies.objects.all().order_by('title', 'release_date')
		json_movies= json.loads(serialize('json', movies))
		return JsonResponse({'data': json_movies})



def get_posters():
		# Need to 'from urllib import request'.
		movies = Movies.objects.all()
		for movie in movies:
				if movie.poster_image != None and movie.poster_image != 'N/A':
						url = movie.poster_image
						# Default size in db is 300px.
						# Modify to obtain larger image.
						url = url.replace('SX300', 'SX1500')
						filename = url[url.rfind("/")+1:]						
						urllib.request.urlretrieve(url, "movies/static/movies/img/" + filename)