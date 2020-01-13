  var nutter = {
	  
	  
	  menu: ["player","catalog","admin"],

	  dropdowns: ["genre", "director", "language", "country"],
	  
	  sort: ["alphabetical", "added", "rating", "released"],

    init: function() {
      let reqObj, reqUrl;
      reqObj = new XMLHttpRequest();
      reqUrl = "/movies/get_movies/";   
      reqObj.open("GET", reqUrl, true);    
      reqObj.send();
      reqObj.onreadystatechange = function()
      {
        if(reqObj.readyState === 4)
        {
          //let 
          movies = JSON.parse(reqObj.response);
          
          movies = movies.data;
          
          movies = nutter.theToTheEnd(movies);
          
          movies = movies.sort(nutter.compareNestedKeys("fields", "title"));
          console.log(movies);
          
          let movieHtml = nutter.getHtml(movies);
          
          document.getElementById("movieGrid").innerHTML = movieHtml;
          
          nutter.openTab(event, 'catalog');
          document.getElementsByClassName("tabLinks")[1].classList.add("active");
          
					// Set dropdowns.
					let dropdownOptions = "";
					let dropdown = "";
					for(let i = 0; i < nutter.dropdowns.length; i++) {
						dd = nutter.dropdowns[i];
						dropdownOptions = nutter.getOptions(movies, dd);
						dropdown = nutter.getDropdown(dd, dropdownOptions);
						document.getElementById(dd + "Dropdown").innerHTML = dropdown;
					}  
          
          // Set a consistent height.
          // Page needs loaded in before height can be determined.
          // Onload, etc. not working. Need to use a timer.
          setTimeout(function(){
            let posters = document.getElementsByClassName("poster");
						let posterHeight = posters[0].offsetHeight;
						for(let i = 0; i < posters.length; i++) {
          		posters[i].style.height = posterHeight;
        		}
          }, 500);
          
	        
          
        }
      }
    },


    getHtml: function(movies) {
      let payload = "";
      let plot = "";
      let m = "";
      let posterUrl = "";
      let nameAnchor = "a";
      let prevNameAnchor = "a";
      for(let i = 0; i < movies.length; i++) {
        m = movies[i].fields;
        if(m.poster_image !== '' && m.poster_image !== null) {
          posterFile = nutter.getFilenameFromUrl(m.poster_image);
        }
        if(m.plot !== '' && m.poster_image !== null) {
          plot = m.plot.slice(0,100) + '...';
        }
	      if(i === 0 || nameAnchor !== m.title.charAt(0).toLowerCase()) {
		      nameAnchor = m.title.charAt(0).toLowerCase();
	      	payload += `<a name="` + nameAnchor + `"></a>`;
        }
        
        payload += 
          `<div class="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-1 movie active" data-pk_id="` + movies[i].pk + `" data-imdb_id="` + m.imdb_id + `" data-index="` + i + `" data-genre="` + m.genre + `, All" data-language="` + m.language + `, All" data-director="` + m.director + `, All" data-country="` + m.country + `, All">
	           <div class="poster" onclick="javascript: nutter.openMovie(` + movies[i].pk + `);">
	            <img class="img-fluid" src="/static/movies/img/` + posterFile + `" />
	            <span class="posterTitle">` + m.title + `
	            <br><span class="posterPlot">` + plot + `</span>
	            </span>
	           </div>
	           <button class="play" onclick="javascript: nutter.openMovie(` + movies[i].pk + `);">OPEN IN PLAYER</button>        
          </div>`;
      }
      return payload;
    },



		getFilenameFromUrl: function(url) {
			filename = url.split('\\').pop().split('/').pop();
			return filename;
		},
		
		
		
    getOptions: function(movies, optionType) {
      let options = [];
      let tempArray = [];
      let flag = false;
      for(let i = 0; i < movies.length; i++) {
        flag = false;
        m = movies[i].fields[optionType];
        if(m !== null && m !== "") {
          tempArray = m.split(",");
          if(options.length < 1) {
            options.push(tempArray[0]);
          }
          for(let j = 0; j < tempArray.length; j++) {
            for(let k = 0; k < options.length; k++) {
              if(tempArray[j].trim() === options[k]) {
                flag = true;
              }
            }
            if(flag === false) {
              options.push(tempArray[j].trim());
            }
          }
        }
      }
      return options.sort();
    },


		getDropdown: function(filter, data) {
			let payload = `<select id="` + filter + `Select" onchange="nutter.filterMovies('` + filter.toString() + `')">
											<option value="all" selected>All ` + filter + `s</option>`;
			for(let i = 0; i < data.length; i++) {
				optionValue = data[i].toLowerCase().replace(" ", "");
				payload += `<option value="` + optionValue + `">` + data[i] + `</option>`;
			}
			payload += `</select>`;
			return payload;
		},
		
		
		filterMovies: function(filter) {
			let id = filter + "Select";
			let el = document.getElementById(id);
			let selected = el.options[el.options.selectedIndex].value;
			let dataSet = "";
			let movies = document.getElementsByClassName("movie");
			let dropdowns = document.getElementsByTagName("select");
			
			// First, zero out the other dropdowns.
			for(j = 0; j < dropdowns.length; j++) {
				if(dropdowns[j].id !== id) {
					dropdowns[j].value = "all";
				}
			}
			for(let i = 0; i < movies.length; i++) {
				dataSet = movies[i].dataset[filter].toLowerCase().replace(" ", "");
				movies[i].classList.add("active");
				movies[i].classList.remove("inactive");
				if(!dataSet.match(selected)) {
					movies[i].classList.remove("active");
					movies[i].classList.add("inactive");
				}
			}
			
		},
		
		
		openMovie: function(id) {
			let movie = "";
			let payload = "";
			let posterImage = "";
			let index = 0;
			
			for(let i = 0; i < movies.length; i++) {
				if(movies[i].pk === id) {
					movie = movies[i].fields;
					index = i;
					break;
				}
			}
			console.log(movie);
			
			// Make sure that there is a valid URL.
			// Grab the larger resolution.
			if(movie.poster_image !== null && movie.poster_image.match(/http/g)) {
				posterImage = nutter.getFilenameFromUrl(movie.poster_image);
				posterImage = posterImage.replace("SX300", "SX1500");
			}
			
			payload += 	`<div class="col-12 col-lg-4">
										<img class="hero img-fluid" src="/static/movies/img/` + posterImage + `" />
									</div>
									<div id="details" class="col-12 col-lg-4" data-pk_id="` + id + `" data-imdb_id="` + movie.imdb_id + `" data-index="` + index + `">
										<h2 id="plot">` + movie.title  + `</h2>
									  <p id="plot">` + movie.plot  + `</p>
									  <br>
									  <p><span class="bold">Released</span>: ` + movie.release_date + `</p>
									  <p><span class="bold">MPAA Rating</span>: ` + movie.rating + `</p>
									  <p><span class="bold">Runtime</span>: ` + movie.runtime + `</p>
									  <p><span class="bold">Genre</span>: ` + movie.genre + `</p>
									  <p><span class="bold">Language</span>: ` + movie.language + `</p>
									  <p><span class="bold">Country</span>: ` + movie.country + `</p>
									  <br>
									  <p><span class="bold">Director</span>: ` + movie.director + `</p>
									  <p><span class="bold">Writer</span>: ` + movie.writer + `</p>
									  <p><span class="bold">Actors</span>: ` + movie.actors + `</p>
									  <br>
									  <p><span class="bold">Awards</span>: ` + movie.awards + `</p>
									  <p><span class="bold">MetaCritic Score</span>: ` + movie.metascore + `</p>
									  <p><span class="bold">IMDB Rating</span>: ` + movie.imdb_rating + `</p>
									  <p><span class="bold">IMDB Votes</span>: ` + movie.imdb_votes + `</p>
									  <br>
									  <p><span class="bold">Production Company</span>: ` + movie.production_company + `</p>
									  <p><span class="bold">Box Office</span>: ` + movie.box_office + `</p>
									  <br>
									  <p><span class="bold">Local File</span>: <a href="file://mnt/movies/` + movie.local_filename + `">Server/MEDIA/Movies/` + movie.local_filename + `</a></p>
									</div>
									<div id="editor" class="col-12 col-lg-4">
										<p>Incorrect details?</p>
										<p><a href="#" onclick="nutter.queryImdbEditor(); return false;">Query for IMDB data and Save to Local Database</a>.</p>
										<p>or...</p>
										<p><a href="#" onclick="nutter.localDataEditor(); return false;">Edit Data Directly rin Local Database</a>.</p>
										<div id="editorPanel"></div>
										<div id="editorResults"></div>
									</div>`;
			
			document.getElementById("movieSingle").innerHTML = payload;
			
			nutter.openTab(event, 'player');
			
			let hero = document.getElementsByClassName("hero")[0];
			let newHeight = window.innerHeight - hero.y - 20;
			hero.height = newHeight;
			
			hero.style.maxHeight = newHeight + "px";
						
			document.getElementsByClassName("tabLinks")[0].classList.add("active");
		},
		
		
		// Editor functions.
		queryImdbEditor: function() {
			let payload = "";
			payload += `<form action="javascript:nutter.searchImdbTitle();" method="get"><label>Enter Title to Search</label><input type="text" name="imdbTitle"><input type="submit" value="Submit"></form>`;
			payload += `<form action="javascript:nutter.searchImdbID();"><label>Enter IMDB ID to Search</label><input type="text" name="imdbID"><input type="submit" value="Submit"></form>`;
			document.getElementById("editorPanel").innerHTML = payload;
		},
		
		localDataEditor: function() {
			
		},
		
		addMovie: function() {
			let payload = "";
			document.getElementById("addMovieForm").style.display = "none";
			payload += `<p>Enter Full DVD Filename (eg: ARRIVAL.dvdmedia):</p><input type="text" name="dvdTitle">`;
			payload += `<form action="javascript:nutter.searchImdbTitle();" method="get"><p>Enter Title to Search:</p><input type="text" name="imdbTitle"><input type="submit" value="Submit"></form>
										<p>or...</p>
										<form action="javascript:nutter.searchImdbID();"><p>Enter IMDB ID to Search:</p><input type="text" name="imdbID"><input type="submit" value="Submit"></form>`;
			//payload += `<form action="javascript:nutter.searchImdbTitle();" method="get"><p>Enter Title to Search:</p><input type="text" name="imdbTitle"><input type="submit" value="Submit"></form>`;
			//payload += `<form action="javascript:nutter.searchImdbID();"><p>Enter IMDB ID to Search:</p><input type="text" name="imdbID"><input type="submit" value="Submit"></form>`;
			document.getElementById("addMovie").innerHTML = payload;
		},

/*
		searchImdbTitle: function() {
			let request;
			let requestURL;
			let title = "";
			let payload = "";
			
			document.getElementById("responseMessage").innerHTML = "";
			
			if(document.getElementsByName("dvdTitle")[0].value !== "") {
				title = document.getElementsByName("dvdTitle")[0].value;
				title = title.replace(".dvdmedia", "");
				title = title.replace("_", " ");
				title = title.toLowerCase();	
			}
      request = new XMLHttpRequest();
      requestURL = "/movies/search_imdb_title_ajax?title=" + title;   
      request.open("GET", requestURL, true);    
      request.send();
      request.onreadystatechange = function() {
	      if(request.readyState === 4) {
	        let response = JSON.parse(request.response);
	        // Simplify the results.
	        let results = response.Search;
	        
	        for(let i = 0; i < results.length; i++) {
		        payload += `<div class="col-2">
		        							<img class="img-fluide" src="` + results[i].Poster + `" />
		        							<p>` + results[i].Title + ` (` + results[i].imdbID + `)</p>
		        							<p><a href="javascript:nutter.insertMovie('` + results[i].imdbID + `');">This is the correct movie - insert into database</a></p>
		        						</div>`;
	        }
	        document.getElementById("addMovieResults").innerHTML = payload;
	        console.log(results);
	        console.log(payload);
	      }
      }
		},
*/
		
		
		searchImdbTitle: function() {
			let request;
			let requestURL;
			let dvdFile = "";
			let title = "";
			let payload = "";
			
			document.getElementById("responseMessage").innerHTML = "";
			
			dvdFile = document.getElementsByName("dvdTitle")[0].value;
			title = document.getElementsByName("imdbTitle")[0].value;

      request = new XMLHttpRequest();
      requestURL = "/movies/search_imdb_title_ajax?title=" + title;   
      request.open("GET", requestURL, true);    
      request.send();
      request.onreadystatechange = function() {
	      if(request.readyState === 4) {
	        let response = JSON.parse(request.response);
	        // Simplify the results.
	        let results = response.Search;
	        
	        for(let i = 0; i < results.length; i++) {
		        payload += `<div class="col-2">
		        							<img class="img-fluide" src="` + results[i].Poster + `" />
		        							<p>` + results[i].Title + ` (` + results[i].imdbID + `)</p>
		        							<p><a href="javascript:nutter.insertMovie('` + results[i].imdbID + `');">This is the correct movie - insert into database</a></p>
		        						</div>`;
	        }
	        document.getElementById("addMovieResults").innerHTML = payload;
	        console.log(results);
	      }
      }
		},
		
		
		searchImdbID: function() {
			let request;
			let requestURL;
			let imdbID = "";
			let payload = "";
			
			document.getElementById("responseMessage").innerHTML = "";
			
			imdbID = document.getElementsByName("imdbID")[0].value;

      request = new XMLHttpRequest();
      requestURL = "/movies/search_imdb_id_ajax?imdb_id=" + imdbID;   
      request.open("GET", requestURL, true);    
      request.send();
      request.onreadystatechange = function() {
	      if(request.readyState === 4) {
	        let response = JSON.parse(request.response);
	        // Simplify the results.
	        result = response;
	        
	        payload += `<div class="col-2">
	        							<img class="img-fluide" src="` + result.Poster + `" />
	        							<p>` + result.Title + ` (` + result.imdbID + `)</p>
	        							<p><a href="javascript:nutter.insertMovie('` + result.imdbID + `');">This is the correct movie - insert into database</a></p>
	        						</div>`;

	        document.getElementById("addMovieResults").innerHTML = payload;
	        console.log(result.Poster);
	      }
      }
		},
		
		
		insertMovie: function(imdbID) {
			let request;
			let requestURL;
			let filename = document.getElementsByName("dvdTitle")[0].value;
			
			request = new XMLHttpRequest();
      requestURL = "/movies/insert_movie_ajax?imdb_id=" + imdbID + "&filename=" + filename;   
      request.open("GET", requestURL, true);    
      request.send();
      request.onreadystatechange = function() {
	      if(request.readyState === 4) {
	        let response = JSON.parse(request.response);
	        document.getElementById("responseMessage").innerHTML = "<p>" + response.response + "</p>";
				}
			}
		},
		
/*
		searchImdbID: function() {
			let request;
			let requestURL;
			let imdbID = document.getElementsByName("imdbID")[0].value;
      request = new XMLHttpRequest();
      requestURL = "/movies/search_imdb_id_ajax?imdb_id=" + imdbID;   
      request.open("GET", requestURL, true);    
      request.send();
      request.onreadystatechange = function() {
	      if(request.readyState === 4) {
	        let response = JSON.parse(request.response);
	        // Simplify the results.
	        let results = response;
	        document.getElementById("addMovieResults").innerHTML = results;
	        console.log(results);
	      }
      }			
		},
*/
		
	  // Misc helper functions.
	  // The top nav tab systems
	  openTab: function(evt, panel) {
		  
	    let tabContent;
	    let tabLinks;
	    
	    tabContent = document.getElementsByClassName("tabContent");
	    
	    for (let i = 0; i < tabContent.length; i++) 
	    {
	      tabContent[i].style.display = "none";
	    }
	    
	    tabLinks = document.getElementsByClassName("tabLinks");
	    
	    for (let j = 0; j < tabLinks.length; j++) 
	    {
	      tabLinks[j].className = tabLinks[j].className.replace(" active", "");
	    }
	    
	    document.getElementById(panel).style.display = "block";
	    
	    if(evt !== null)
	    {
	      evt.currentTarget.className += " active";
	    }
	    
	    if(panel === "catalog") {
		    document.getElementById("jump").style.display = "inline-flex";
	    }
	    else {
		    document.getElementById("jump").style.display = "none";
	    }
	    //window.scrollTo(0,0);
	  },
	  
	  
	  // Move "The" to the end for sorting purposes.
		theToTheEnd: function(movies) {
			
			let title = "";
			let titleThe = "";
			let titleRest = "";
			
			for(let i = 0; i < movies.length; i++) {
				
				title = movies[i].fields.title;
				
				if(title.indexOf("The ") === 0) {
					titleThe = title.slice(0,4);
					titleRest = title.slice(4);
					movies[i].fields.title = titleRest + ", The";	
				}
			}
			return movies;
		},
		
		
	// Sorting.
  // Taken from Sitepoint blog (Olayinka Omole): https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
  compareNestedKeys: function(key1, key2, order='desc')
  {
    return function(a, b) 
    {
/*
      if(!a.hasOwnProperty(key1) || !b.hasOwnProperty(key1) || !a.hasOwnProperty(key2) || !b.hasOwnProperty(key2)) 
      {
        return 0; 
      }
*/
      
      const varA = (typeof a[key1][key2] === 'string') ? a[key1][key2].toUpperCase() : a[key1][key2];
      const varB = (typeof b[key1][key2] === 'string') ? b[key1][key2].toUpperCase() : b[key1][key2];
        
      let comparison = 0;
      if (varA > varB) 
      {
        comparison = 1;
      } 
      else if (varA < varB) 
      {
        comparison = -1;
      }
      return ((order == 'asc') ? (comparison * -1) : comparison);
    }
  }

}