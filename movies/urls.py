from django.urls import path
from . import views
from . import imdb
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', views.index, name='index'),
    path('get_movies/', views.get_movies, name='get_movies'),    
    path('search_imdb_title_ajax/', imdb.search_imdb_title_ajax, name='search_imdb_title_ajax'),
    path('search_imdb_id_ajax/', imdb.search_imdb_id_ajax, name='search_imdb_id_ajax'),
    path('insert_movie_ajax/', imdb.insert_movie_ajax, name='insert_movie_ajax'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)