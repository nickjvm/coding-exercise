
(function() {

	var Leaderboard = function() {
		var self = this;

		self.options = {
			frequency:15,
			limit:5
		};

		self.transitionDelay = 0;

		//caching DOM queries.
		self.$leaderboard = $(".leaderboard");

		//use this as the template to use when updating the leaderboard with new bands.
		//this way we only query the DOM once for this element.
		self.$placementTemplate = $(".leaderboard .template").removeClass("template");

		//the main update function, this is the callback when the request for a new leaderboard object is complete.
		self.update = function(data) {
			//a little bit of light error handling.
			if(!Array.isArray(data)) {
				throw new Error("Something's wrong here...");
			}

			self.$leaderboard.addClass("fetching");
			var html = "";

			for(var i = 0;i<data.length;i++) {
				var item = data[i],
					template = self.$placementTemplate.clone().removeClass('is-hidden');
				
				//comma-separate the count value
				item.formattedCount = item.count.toLocaleString("en-US");

				//fill in the blanks
				$(".leaderboard-name",template).text(item.name);
				$(".leaderboard-metrics--count",template).text(item.formattedCount);

				//get the HTML of the leaderboard item, including the parent
				html += $("<div/>").append(template).html();
			}
			
			setTimeout(function() {
				//don't empty the leaderboard and append the new HTML until the CSS transition have finished
				self.$leaderboard.empty().append(html);

				setTimeout(function() {
					//removal of ".fetching" is within another timeout so that it happens 
					//at the end of the stack. Without, the animate in never occurs on the new DOM elements.
					self.$leaderboard.removeClass("fetching");
				},25);

			},self.transitionDelay);
		};

		self.init = function() {
			self.poller = new massrel.Poller(self.options,self.update);

			self.poller.start();

			//self.transitionDelay is set to 0 on init so there is no delay on first load.
			//after first load is complete, setup a delay to give the CSS transitions time to complete before updating.
			self.transitionDelay = 750;
		};

		//GO
		self.init();

		return self;
	};

	$(document).ready(function() {
		massrel.Leaderboard = new Leaderboard();
	});

})();