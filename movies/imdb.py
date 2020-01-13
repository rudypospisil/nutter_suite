import os
import requests
import configparser
import pdb
import sys

from smbclient import (
    listdir,
    mkdir,
    register_session,
    rmdir,
    scandir,
)
import fnmatch
import sqlite3
import json
import datetime
from urllib import request
from django.http import JsonResponse
from django.http import HttpResponse
from movies.models import Movies


config = configparser.ConfigParser()
config.read('/home/dev/nutter_suite/nutter_suite/movies/config.py')

MOVIES_PATH = config.get('dir', 'path')
USER = config.get('dir', 'user')
PASSWORD = config.get('dir', 'pwd')
IMDB_HOST = config.get('imdb', 'host')
IMDB_URL = config.get('imdb', 'url')
IMDB_KEY = config.get('imdb', 'key')
IMDB_HEADERS = config.get('imdb', 'headers')
MOVIE_DB = config.get('sql', 'db')
INSERT_MOVIE = config.get('sql', 'ins_movie')
INSERT_MOVIE_FROM_IMDB = config.get('sql', 'ins_movie_from_imdb')
SELECT_MOVIE = config.get('sql', 'sel_movie')
SELECT_MOVIES = config.get('sql', 'sel_movies')
UPDATE_MOVIE_ID = config.get('sql', 'upd_movie_id')
UPDATE_MOVIE_DATA = config.get('sql', 'upd_movie_data')



def search_imdb_title_cli():
		title = input('Enter Title To Search For: ')
		year = input('(Optional) Enter a Year: ')
		page = input('(Optional) Enter Page of Results to Return (default is 1): ')
		if title == '':
				exit()
		if year == '':
				year = ''
		if page == '':
				page = '1'
		query_string = { "s":title, "y":year, "type":"movie", "page":page, "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdbDict = json.loads(response.text)
		print(imdbDict)

def search_imdb_title_ajax(request):
		#pdb.set_trace()
		if 'title' in request.GET:
				title = request.GET['title']
		else:
				title = ''
		if 'year' in request.GET:
				year = request.GET['year']
		else:
				year = ''
		if 'page' in request.GET:
				page = request.GET['page']
		else:
				page = '1'
		query_string = { "s":title, "y":year, "type":"movie", "page":page, "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdbDict = json.loads(response.text)
		return JsonResponse(imdbDict)


def search_imdb_id(imdb_id):
		query_string = { "i":imdb_id, "plot":"full", "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdb_dict = json.loads(response.text)
		print(imdb_dict)
		return imdb_dict
		
def search_imdb_id_cli():
		id = input('Enter IMDB ID To Query: ')
		if id == '':
				exit()
		query_string = { "i":id, "plot":"full", "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdb_dict = json.loads(response.text)
		print(imdb_dict)
		
def search_imdb_id_ajax(request):
		#pdb.set_trace()
		if 'imdb_id' in request.GET:
				imdb_id = request.GET['imdb_id']
		else:
				imdb_id = ''
		query_string = { "i":imdb_id, "plot":"full", "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdb_dict = json.loads(response.text)
		return JsonResponse(imdb_dict)


def insert_movie_ajax(request):
		if 'imdb_id' in request.GET:
				imdb_id = request.GET['imdb_id']
		else:
				return JsonResponse({'response':'IMDB ID is needed.'})
				
		# Make sure that movie isn't already in database.
		if Movies.objects.filter(imdb_id=imdb_id).exists():
				return JsonResponse({'response': imdb_id + ' is already in the database.'})
		else:
				if 'filename' in request.GET:
						local_filename = request.GET['filename']
				else:
						local_filename = 'N/A'
						
				# Get movie details by querying the IMDB database with imdb_id.
				imdb_dict = search_imdb_id(imdb_id)
				
				if imdb_dict['Response'] == 'True':
						movies=Movies()

						d = imdb_dict
						# Need to ensure that all keys are accounted for. IMDB returns are not always consistent.
						movies.imdb_id = imdb_id
						movies.title = d['Title'] if 'Title' in d else ''
						movies.year = d['Year'] if 'Year' in d else ''
						movies.rating = d['Rated'] if 'Rated' in d else ''
						movies.release_date = d['Released'] if 'Released' in d else ''
						movies.runtime = d['Runtime'] if 'Runtime' in d else ''
						movies.genre = d['Genre'] if 'Genre' in d else ''
						movies.director = d['Director'] if 'Director' in d else ''
						movies.writer = d['Writer'] if 'Writer' in d else ''
						movies.actors = d['Actors'] if 'Actors' in d else ''
						movies.plot = d['Plot'] if 'Plot' in d else ''
						movies.language = d['Language'] if 'Language' in d else ''
						movies.country = d['Country'] if 'Country' in d else ''
						movies.awards = d['Awards'] if 'Awards' in d else ''
						movies.poster_image = d['Poster'] if 'Poster' in d else ''
						movies.metascore = d['Metascore'] if 'Metascore' in d else ''
						movies.imdb_rating = d['imdbRating'] if 'imdbRating' in d else ''
						movies.imdb_votes = d['imdbVotes'] if 'imdbVotes' in d else ''
						movies.type = d['Type'] if 'Type' in d else ''
						movies.dvd_release_date = d['DVD'] if 'DVD' in d else ''
						movies.box_office = d['BoxOffice'] if 'BoxOffice' in d else ''
						movies.production_company = d['Production'] if 'Production' in d else ''
						movies.website_url = d['Website'] if 'Website' in d else ''
						movies.local_filename = local_filename
						movies.timestamp = datetime.datetime.now()
			
						try:
								movies.save()
								
						except sqlite3.Error as err:
								print(f"Error {err.args[0]}")
								sys.exit(1)	
				
						if fnmatch.fnmatch(movies.poster_image, 'http*'):
								downloadPosterImages(movies.poster_image)
				
				return JsonResponse({'response':'Success. Data inserted. Images downloaded.'})


def downloadPosterImages(poster_image_url):
		# Need to 'from urllib import request'.
		# Default size in db is 300px.
		filename_300 = poster_image_url[poster_image_url.rfind("/")+1:]						
		request.urlretrieve(poster_image_url, "movies/static/movies/img/" + filename_300)
		# Modify to obtain larger image.
		filename_1500 = filename_300.replace('SX300', 'SX1500')					
		poster_image_url_1500 = poster_image_url.replace('SX300', 'SX1500')					
		request.urlretrieve(poster_image_url_1500, "movies/static/movies/img/" + filename_1500)



def select_movie(imdb_id):
		movie = Movies.objects.get(imdb_id=imdb_id)
		if movie != None:
				return movie
		else:
				return None
		
		
def read_directory():
		#movie_titles = []
		register_session("Server", username=USER, password=PASSWORD)
		
		for file in scandir(MOVIES_PATH):
				if fnmatch.fnmatch(file.name, '*.dvdmedia'):
						title = file.name.replace('_', ' ').replace('.dvdmedia', '').title()
						#movie_titles.append(title)

						insert_movie(title, file.name)
						
						#pdb.set_trace()
		    	
				#movie_titles.sort()

		
def insert_movie(title, filename):
		print(title, filename)
		try:
				conn = sqlite3.connect(MOVIE_DB)
				cur = conn.cursor()
				cur.execute(INSERT_MOVIE, (title, filename))
				conn.commit()
				
		except sqlite3.Error as err:
				print(f"Error {err.args[0]}")
				sys.exit(1)
		conn.close()
		
		
def get_movies():
		movies = []
		try:
				conn = sqlite3.connect(MOVIE_DB)
				cur = conn.cursor()
				cur.execute(SELECT_MOVIES)
				movies = cur.fetchall()
		except sqlite3.Error as err:
				print(err)
				sys.exit(1)
				
		conn.close()
		
		return movies


def set_imdb_id(id, title, year = ''):
		print(title + ": ")

		try:
				# Set to lowercase for API. It seems to be sensitive that way.
				query_string = {"page":"1","r":"json", "s":title.lower(), "y":year, "t":"movie"}
				headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }

				response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)

				imdbObj = json.loads(response.text)

				print(imdbObj)

				if imdbObj['Response'] == 'True':
						# A perfect match will be the first one in the object.
						if imdbObj['Search'][0]['Title'].lower() == title.lower():
								accept = input('Do you want to use ' + '"' + imdbObj['Search'][0]['Title'] + '" for the match?')
								if accept == 'y':
										# Replace title with exact IMDB title.
										conn = sqlite3.connect(MOVIE_DB)
										cur = conn.cursor()
										#pdb.set_trace()
										cur.execute(UPDATE_MOVIE, (imdbObj['Search'][0]['imdbID'], imdbObj['Search'][0]['Title'], id))
										conn.commit()
										conn.close()
						# This will ask if the first result is the match you want.
						else:
								accept = input('Do you want to use ' + '"' + imdbObj['Search'][0]['Title'] + '" for the match?')
								if accept == 'y':
										conn = sqlite3.connect(MOVIE_DB)
										cur = conn.cursor()
										cur.execute(UPDATE_MOVIE, (imdbObj['Search'][0]['imdbID'], imdbObj['Search'][0]['Title'], id))
										conn.commit()
										conn.close()
								else:
										if accept == 'n':
												search_manual_title_and_year(id)

				# If still no match, we'll need more manual intervention.
				else:
						search_manual_title(id)

		except sqlite3.Error as err:
				print(err)
				sys.ext(1)

		print("\n")


def search_manual_title(id):
		new_title = input('Try fine tuning the title: ')
		#year = input('and try using a year: ')
		if new_title != '':
				set_imdb_id(id, new_title)
		else:
				return
		
		
def search_manual_title_and_year(id):
		new_title = input('Try fine tuning the title: ')
		year = input('and try using a year: ')
		if new_title != '':
				set_imdb_id(id, new_title, year)
		else:
				return
		


def search_imdb_title_cli():
		title = input('Enter Title To Search For: ')
		year = input('(Optional) Enter a Year: ')
		page = input('(Optional) Enter Page of Results to Return (default is 1): ')
		if title == '':
				exit()
		if year == '':
				year = ''
		if page == '':
				page = '1'
		query_string = { "s":title, "y":year, "type":"movie", "page":page, "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdbDict = json.loads(response.text)
		print(imdbDict)


def search_imdb_id_cli():
		id = input('Enter IMDB ID To Query: ')
		if id == '':
				exit()
		query_string = { "i":id, "r":"json" }
		headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
		response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)
		imdbDict = json.loads(response.text)
		print(imdbDict)



def set_imdb_movie_data(id, imdb_id):
		try:
				# Set to lowercase for API. It seems to be sensitive that way.
				query_string = { "i":imdb_id, "plot":"full", "r":"json" }
				headers = { 'x-rapidapi-host': IMDB_HOST, 'x-rapidapi-key': IMDB_KEY }
				response = requests.request('GET', IMDB_URL, headers=headers, params=query_string)

				imdbMovieDict = json.loads(response.text)

				print(imdbMovieDict)

				

				if imdbMovieDict['Response'] == 'True':

						m = imdbMovieDict

						# Exceptions for TV Series. The following keys are not present if type="series".
						if 'DVD' in m:
								dvd = m['DVD']
						else:
								dvd = ''
						if 'BoxOffice' in m:
								box_office = m['BoxOffice']
						else:
								box_office = ''
						if 'Production' in m:
								production_house = m['Production']
						else:
								production_house = ''
						if 'Website' in m:
								website_url = m['Website']
						else:
								website_url = ''

						# Replace title with exact IMDB title.
						conn = sqlite3.connect(MOVIE_DB)
						cur = conn.cursor()
						#pdb.set_trace()
						
						cur.execute(UPDATE_MOVIE_DATA, (m['Title'], m['Year'], m['Rated'], m['Released'], m['Runtime'], m['Genre'], m['Director'], m['Writer'], m['Actors'], m['Plot'], m['Language'], m['Country'], m['Awards'], m['Poster'], m['Metascore'], m['imdbRating'], m['Type'], dvd, box_office, production_house, website_url, '2020-01-07', id, imdb_id))

						conn.commit()
						conn.close()

						#pdb.set_trace()

		except sqlite3.Error as err:
				print(err)
				sys.exit(1)

def main():
		# Main program.
		movies = get_movies()
		
		
		# Loop through the movie list and insert IMDB IDs.
		for movie in movies:
				print(movie)
				#pdb.set_trace()
		
				# Grab IMDB ID from API.
				# if movie[1] == None:
				# 		set_imdb_id(movie[0], movie[2])
				# else:
				# 		print("IMDB ID already present.")
		
				# Insert IMDB data.
				if movie[1] != None and movie[3] == None:
						set_imdb_movie_data(movie[0], movie[1])
				else:
						print("No IMDB ID in db to query.")

