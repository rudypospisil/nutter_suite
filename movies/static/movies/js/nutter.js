  var nutter = {

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
          
          let movieHtml = nutter.getHtml(movies);
          
          document.getElementById("movieGrid").innerHTML = movieHtml;
          
          nutter.openTab(event, 'catalog');
          
					// Set dropdowns.
          let genres = nutter.getOptions(movies, "genre");
          let genreDropdown = nutter.getDropdown("genre", genres);
          document.getElementById("genreDropdown").innerHTML = genreDropdown;         
          
          let directors = nutter.getOptions(movies, "director");
          let directorDropdown = nutter.getDropdown("director", directors);
          document.getElementById("directorDropdown").innerHTML = directorDropdown;         
          
          let languages = nutter.getOptions(movies, "language");
          let languageDropdown = nutter.getDropdown("language", languages);
          document.getElementById("languageDropdown").innerHTML = languageDropdown;         
          
          let countries = nutter.getOptions(movies, "country");
          let countryDropdown = nutter.getDropdown("country", countries);
          document.getElementById("countryDropdown").innerHTML = countryDropdown;         
          
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
      for(let i = 0; i < movies.data.length; i++) {
        m = movies.data[i].fields;
        if(m.poster_image !== '' && m.poster_image !== null) {
          posterFile = nutter.getFilenameFromUrl(m.poster_image);
        }
        if(m.plot !== '' && m.poster_image !== null) {
          plot = m.plot.slice(0,100) + '...';
        }
        payload += 
          `<div class="col-12 col-sm-6 col-md-3 col-lg-2 col-xl-1 movie active" data-id="` + movies.data[i].pk + `" data-imdb_id="` + m.imdb_id + `" data-genre="` + m.genre + `, All" data-language="` + m.language + `, All" data-director="` + m.director + `, All" data-country="` + m.country + `, All">
	           <div class="poster" onclick="javascript: nutter.openMovie(` + movies.data[i].pk + `);">
	            <img class="img-fluid" src="/static/movies/img/` + posterFile + `" />
	            <span class="posterTitle">` + m.title + `
	            <br><span class="posterPlot">` + plot + `</span>
	            </span>
	           </div>
	           <button class="play" onclick="javascript: nutter.openMovie(` + movies.data[i].pk + `);">OPEN IN PLAYER</button>        
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
      for(let i = 0; i < movies.data.length; i++) {
        flag = false;
        m = movies.data[i].fields[optionType];
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
			
			for(let i = 0; i < movies.data.length; i++) {
				if(movies.data[i].pk === id) {
					movie = movies.data[i].fields;
					break;
				}
			}
			console.log(movie);
			
			// Make sure that there is a valid URL.
			if(movie.poster_image !== null && movie.poster_image.match(/http/g)) {
				posterImage = nutter.getFilenameFromUrl(movie.poster_image);
				posterImage = posterImage.replace("SX300", "SX1500");
			}
			
			payload += 	`<div class="col-12 col-lg-4">
										<h1>` + movie.title + `</h1>
										<img class="hero img-fluid" src="/static/movies/img/` + posterImage + `" />
									</div>
									<div id="details" class="col-12 col-lg-4">
									  <p id="plot">` + movie.plot  + `</p>
									  <br>
									  <p><span class="bold">Released</span>: ` + movie.release_date + `</p>
									  <p><span class="bold">Rated</span>: ` + movie.rating + `</p>
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
									  <br>
									  <p><span class="bold">Production Company</span>: ` + movie.production_company + `</p>
									  <p><span class="bold">Box Office</span>: ` + movie.box_office + `</p>
									  <br>
									  <p><span class="bold">Local File</span>: ` + movie.local_filename + `</p>
									</div>
									<div id="editor" class="col-12 col-lg-4">
										<p>Incorrect details?</p>
										<p><a href="javascript: onclick='nutter.editorIMDB()'">Query for IMDB data via IMDB ID or Movie Title</a>.</p>
										<p>or...</p>
										<p><a href="javascript: onclick='nutter.editorLocal()'">Edit Data in Local Database</a>.</p>
										<div id="editPanel"></div>
									</div>`;
			
			document.getElementById("movieSingle").innerHTML = payload;
			
			nutter.openTab(event, 'player');
			
			let hero = document.getElementsByClassName("hero")[0];
			let newHeight = window.innerHeight - hero.y - 20;
			hero.height = newHeight;
			
			hero.style.maxHeight = newHeight + "px";
						
			
		},
		
		
		imdbEditor: function() {
			
			
			
		},
		
		
	  // Misc helper functions.
	  // The top nav tab systems
	  openTab: function(evt, panel) 
	  {
	    let tabContent, tabLinks;
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
	    window.scrollTo(0,0);
	  } 

}