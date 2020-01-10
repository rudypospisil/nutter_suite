from django.db import models

class Movies(models.Model):
		imdb_id = models.CharField(max_length=10, blank=True, null=True)
		title = models.TextField(blank=True, null=True)
		year = models.IntegerField(default=0, blank=True, null=True)
		rating = models.CharField(max_length=10, blank=True, null=True)
		release_date = models.CharField(max_length=50, blank=True, null=True)
		runtime = models.CharField(max_length=50, blank=True, null=True)
		genre = models.TextField(blank=True, null=True)
		director = models.TextField(blank=True, null=True)
		writer = models.TextField(blank=True, null=True)
		actors = models.TextField(blank=True, null=True)
		plot = models.TextField(blank=True, null=True)
		language = models.TextField(blank=True, null=True)
		country = models.TextField(blank=True, null=True)
		awards = models.TextField(blank=True, null=True)
		poster_image = models.TextField(blank=True, null=True)
		metascore = models.CharField(max_length=10, blank=True, null=True)
		imdb_rating = models.CharField(max_length=10, blank=True, null=True)
		imdb_votes = models.CharField(max_length=100, blank=True, null=True)
		type = models.CharField(max_length=50, blank=True, null=True)
		dvd_release_date = models.CharField(max_length=100, blank=True, null=True)
		box_office = models.CharField(max_length=100, blank=True, null=True)
		production_company = models.TextField(blank=True, null=True)
		website_url = models.TextField(blank=True, null=True)
		local_filename = models.TextField(blank=True, null=True)
		timestamp = models.DateTimeField()

		def __str__(self):
				return self.title

#IMDB, Meta Critic, Rotten Tomatoes, Beradinelli, Cinema Score, The Guardian
class Reviewers(models.Model):
    source = models.CharField(max_length=200)
    url = models.CharField(max_length=500, blank=True, null=True)
    timestamp = models.DateTimeField()
    
class Ratings(models.Model):
    imdb_id = models.CharField(max_length=10, blank=True, null=True)
    reviewer = models.ForeignKey(Reviewers, on_delete=models.CASCADE)
    rating = models.CharField(max_length=100, blank=True, null=True)
    review = models.TextField(blank=True, null=True)
    url = models.TextField(blank=True, null=True)
    publish_date = models.DateTimeField()
    timestamp = models.DateTimeField()
