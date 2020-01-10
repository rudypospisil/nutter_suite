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


#pdb.set_trace()

config = configparser.ConfigParser()
config.read('config.py')

MOVIES_PATH = config.get('dir', 'path')
USER = config.get('dir', 'user')
PASSWORD = config.get('dir', 'pwd')
IMDB_HOST = config.get('imdb', 'host')
IMDB_URL = config.get('imdb', 'url')
IMDB_KEY = config.get('imdb', 'key')
IMDB_HEADERS = config.get('imdb', 'headers')
MOVIE_DB = config.get('sql', 'db')
INSERT_MOVIE = config.get('sql', 'ins_movie')
SELECT_MOVIES = config.get('sql', 'sel_movies')
UPDATE_MOVIE_ID = config.get('sql', 'upd_movie_id')
UPDATE_MOVIE_DATA = config.get('sql', 'upd_movie_data')



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
				sys.ext(1)
				
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
				sys.ext(1)

	
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

