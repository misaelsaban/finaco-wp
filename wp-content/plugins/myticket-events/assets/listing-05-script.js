/**
 * MyTicket Hall Layout created by Kenzap on 14/02/2020.
 */

jQuery(function ($) {
	"use strict";

	// seat layout selector
	var khl = ".kenzap-hall-layout";
	// 1 draw seats over hall layout | 0 draw zones over hall layout
	var renderType = $(khl).data('rendertype');
	// seat shape 
	var seatShape = $(khl).data('seatmode'); // circle rect
	// seat shape 
	var numOpacity = $(khl).data('numopacity'); // hide/show seat numbers
	var numOpacity2 = $(khl).data('numopacity2'); // hide/show seat numbers
	// seat shape 
	var snSize = $(khl).data('snsize'); // hide/show seat numbers
	// seat shape 
	var hideNumbers = $(khl).data('hidenumbers'); // define seat opacity
	// hall layout json structure
	var hall_js = '';
	// ticket reservation array
	var tickets_global = [];
	// unique booking session identifier
	var myticketUserId = "";
	// selected zone id
	var current_zone_id = -1;
	// init ajax call timer
	var myticketCalls = "";
	// adds seat/zone listener delay before bookings are loaded
	var firstLoad = 60;
	// keys to exclude from kenzap-hall-layout checkout
	var exclude = ["coords", "attributes", "points"];
	// summary table
	var summary_table = '';
	// used to block UI when AJAX call is delayed
	var pending_reservations = true;
	// global variable to store all bookings
	var reservations = [], reservations_zones = [];
	// to detect if number of reservations changes
	var bi_prev;
	
	$(function() {

		if($(khl).length){
			
			// add tickets to cart listener
			$(".kp-btn-reserve").on("click", function(){

				setReservations();
				return false;
			});

			// generate unique user id valid during booking only
			if(getCookie("myticket_user_id")!=''){
				myticketUserId = getCookie("myticket_user_id");
			}else{
				myticketUserId = makeid();
				createCookie("myticket_user_id",myticketUserId,1);
			}

			// reserved but not yet booked ticket list
			if(getCookie("tickets_"+$(khl).data("id"))!='')
				tickets_global = JSON.parse(getCookie("tickets_"+$(khl).data("id")));

			// get layout code from html sript
			let hall = $("#kenzap-hall-layout-code").html();

			hall_js = JSON.parse(hall);
			initLayout();
		}
	});

	// initalize frontend layout rendering
	function initLayout(){

		myticketCalls = setInterval(checkReservations, 3000, true);

		// get summary table structure
		summary_table = $(".kp-ticket-row").html();
		
		// date change listener
		$( ".date_select" ).change(function() {

			if(tickets_global.length>0){
				var l = confirm($(khl).data("switch_date"));
				if(l){ tickets_global = []; refreshSelectedTicket(tickets_global, hall_js, -1, -1); location.href = '?eid='+$(this).val(); }	
			}else{
				location.href = '?eid='+$(this).val();
			}
		});

		// HTML area to output seats or zones
		var kp_svg = $(".kp_svg");
		var i = 0;

		// get backend stored data
		checkReservations();

		// load hall layout image
		$("#myticket_img").attr("src", hall_js.img);
		
		// stop loading if all events expired
		if($( ".date_select" ).val()=="") return;

		// struct everything
		$("#myticket_img").load(function() {

			$("#myticket_img").css('position', 'absolute');

			// get backend stored data
			checkReservations();

			// find scale factor
			var polygon_scale = hall_js.img_width / parseInt($(khl).data("dwidth"));

			// set up layout proportions with the browsers screen
			var mwidth = $("#myticket_img").width();
			var mheight = $("#myticket_img").height();
			$("#kp_image").css("width", mwidth);
			$("#svg").css("width", mwidth);
			$("#svg").css("height", mheight);
			polygon_scale = hall_js.img_width / parseInt(mwidth);
			var hall = hall_js;

			// switch layout rendering scenarious
			switch(renderType){

				// mode 1 overlay hall layout image with interactive seat polygons
				case 1:

					var cp = hall_js.areas.map(function(item, z) {

						// map seats
						var tws = 0;
						if (hall.areas[z].seats){
				
							// total seats per zone
							tws = hall.areas[z].seats.tws;
				
							// seat size
							if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
							var height = parseFloat(hall.areas[z].seats.height) / polygon_scale / 2;
							var s = 0;
							while (s < tws){
				
								// seat default coordinates
								var x = 0;
								var y = 0;
				
								// prevent undefined js error
								if ( !hall.areas[z].seats.points ) hall.areas[z].seats.points = [];
				
								// get central point 
								var x = 0, y = 0, xc = 0, yc = 0, i = 0, x_start = 99999, y_start = 99999;
								var cp = hall.areas[z].coords.points.map(function(item) {

									if(x_start > item.x) x_start = item.x;
									if(y_start > item.y) y_start = item.y;
									i++;
									x += item.x; y += item.y;
									return item;
								});
							
								// calc all x and y coords separately. Divide by the total amount of coords to find central point
								xc = x / i;
								yc = y / i;

								// get mapped seat coordinates and align them accordingly
								if ( hall.areas[z].seats.points[s] ){
				
									x = xc / polygon_scale + (hall.areas[z].seats.points[s].x) / polygon_scale;
									y = yc / polygon_scale + (hall.areas[z].seats.points[s].y) / polygon_scale;
								}
				
								// get seat HTML
								var seat = structSeat(hall, z, s, height, x, y);
				
								// add seat to hall layout canvas
								seat.g.obj = this;
								kp_svg.append(seat.g);

								// svg_mapping.append(seat.g);
								s++;
							}
						}
						
						i++;
					});

				break;
				// mode 0 overlay hall layout image with interactive zone polygons
				case 0:

					// hall_js.passes = {};
					var cp = hall_js.areas.map(function(item, z) {

						// generate DOM elements
						var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
						var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

						// draw zone overlay polygon 
						polygon.setAttribute('points', item.coords.points.map(function(item) { return item.x / polygon_scale + " " + item.y / polygon_scale; }));
						polygon.setAttribute('data-index', i);
						polygon.setAttribute('id', "pl"+i);
						g.appendChild(polygon);
						kp_svg.append(g);
						i++;

						var tns = 0, tws = 0; 
						
						// populate passes array
						if (hall.areas[z].seats){

							// total seats per zone
							tns = parseInt(hall.areas[z].seats.tns);
							tws = parseInt(hall.areas[z].seats.tws);

							if(hall_js.areas[z].passes === undefined) hall_js.areas[z].passes = [];

							var s = 0;
							while (s < tns){

								// if(hall_js.passes[z].seats === undefined) hall_js.passes[z].seats = [];
								// hall_js.passes[z].seats.push({id: "p"+(s+tws)+'z'+z, uid: "", class: ""});
								hall_js.areas[z].passes.push({id: "p"+parseInt(s+tws)+'z'+z, uid: "", class: ""});
								s++;
							}
						}

						// fade in
						$("#kp_image").animate({opacity: '100%'}, 300);
				
						return item;
					});

				break;
			}
			
			// mode 0 add layout zone seat preview event
			$("polygon").on("click", function(){

				var z = $(this).data("index");

				// ignore clicks if zone is fully booked
				if(!$(this).hasClass("booked")){

					// single click full zone reservation mode
					if(hall_js.areas[z].seats.tws == 0 && hall_js.areas[z].seats.tns == 1){

						// check of already reserved
						var reserved = jQuery.grep(tickets_global, function(value) {
							return value.zone_id == z
						});
				
						// unreserve zone and finish here
						if(reserved.length == 1){

							toggleZoneReservation(z, hall_js, '', '');
							return;
						}

						// check if not exceeding max allowed 
						if(tickets_global.length>=parseInt($(khl).data("ticketspbooking"))){
							alert($(khl).data("ajax_max_tickets"));
							return;
						}

						// check for variations
						if(!hall_js.pcfs) hall_js.pcfs = [];
						let pcfshtml = '';
						for(let pv of hall_js.pcfs){

							if(hall_js.areas[z].seats['pcf'+pv.index]) pcfshtml += '\
							<li>\
								<input value="'+hall_js.areas[z].seats['pcf'+pv.index]+'" data-label="'+pv.label+'" type="radio" id="pvar-'+pv.index+'" name="selector">\
								<label for="pvar-'+pv.index+'">' + pv.label + ' (' + formatPrice(hall_js.areas[z].seats['pcf'+pv.index]) + ') </label>\
								<div class="check"></div>\
							</li>';
							
							console.log(hall.areas[z].seats['pcf'+pv.index]);
						}

						// load price variation picker
						if(pcfshtml){

							$("#variation_cont_zone ul.pvar").html(pcfshtml);

							// assign variation listeners
							$("#variation_cont_zone ul.pvar input[type=radio]").change(function() {

								toggleZoneReservation(z, hall_js, this.value, this.dataset.label);

								$("#variation_cont_zone").fadeOut();
								// alert(this.value);
								// doSeatSelection(hall, ticket_id, z, s, this.value, this.dataset.label);
							});

							$("#variation_cont_zone").fadeIn();

							// user asks to close
							$(".var_toolbar_close .times").click(function() { $("#variation_cont_zone").fadeOut(); });
	
						}else{

							toggleZoneReservation(z, hall_js, '', '');
						}

					}else{
						showSeatSelection(z, hall_js, '', '');
					}
				}
			});

			refreshSelectedTicket(tickets_global, hall_js, -1, -1);
		});
	}

	// reserve unreserve full zone
	function toggleZoneReservation(z, hall, p, t){

		// var tns = hall.areas[z].seats.tns;
		var ticket_id = '0z'+z;

		// get reserved tickets
		var reserved = jQuery.grep(tickets_global, function(value) {
			return value.zone_id == z
		});

		// unreserve
		if(reserved.length == 1){  

			tickets_global = jQuery.grep(tickets_global, function(value) {
				return !(value.zone_id == z);
			});

			// mark zone as free instantly 
			$("#pl"+z).removeClass("selected");

		// reserve	
		}else{

			// check if not exceeding max allowed 
			if(tickets_global.length>=parseInt($(khl).data("ticketspbooking"))){
				alert($(khl).data("ajax_max_tickets"));
				return;
			}

			// set ticket object defaults
			var ticket_text = 1, ticket_row = '', ticket_price = '', zone_text = hall.areas[z].seats.title;
			if(hall.areas[z].seats.price) ticket_price = hall.areas[z].seats.price;
			if(p!='') ticket_price = p;
			if(ticket_row=='') ticket_row = zone_text

			// structure ticket object 
			var ticket_obj = {zone_id: z, zone_text: zone_text, ticket_id: ticket_id, ticket_text: ticket_text + (t ? ' ('+t+') ':''), ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, ticket_type: "pass", type: "pass" };

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map(function(key, index) {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!exclude.includes(key)){ ticket_obj[key] = hall.areas[z].seats[key]; }
			});
	
			ticket_obj['price'] = ticket_price;
			
			// push object to ticket global array
			tickets_global.push(ticket_obj);
			
			// mark zone as reserved instantly
			$("#pl"+z).addClass("selected");
		}

		refreshSelectedTicket(tickets_global, hall, z, -1);
	}

	// popup window to pick up seat from the zone
	function showSeatSelection(z, hall){

		$("body").prepend($("#seat_mapping").clone().addClass("seat_mapping_temp"));

		var svg_mapping = $("#svg_mapping");
		var svg_number_cont = $("#svg_number_cont");
		var svg_mapping_cont = $("#svg_mapping_cont");
		var svg_width = $(window).width()-200;
		var svg_height = $(window).height()-200;
		var svg_min_width = parseInt($(khl).data("sminwidth"));
		var svg_max_height = parseInt($(khl).data("smaxwidth"));

		if(svg_width<svg_min_width)
			svg_width = svg_min_width;
		if(svg_width>svg_max_height)
			svg_width = svg_max_height;
		if(svg_height<600)
			svg_height = 600;
		
		current_zone_id = z;
		pending_reservations = true;
		checkReservations();

		$("#seat_mapping").fadeIn();
		svg_mapping.html("");

		// reset picker if exists
		$(".picker_select").removeClass('rendered');

		// get central point 
		var x = 0, y = 0, xc = 0, yc = 0, i = 0;
		var cp = hall.areas[z].coords.points.map(function(item) {

			i++; x += item.x; y += item.y;
			return item;
		});

		// calc all x and y coords separately. Divide by the total amount of coords to find central point
		xc = x / i;
		yc = y / i;

		// get relative distance from coords to center point
		var il = 0, yl = 0, xl = 0, max_times = 1;
		hall.areas[z].coords.points_rel = [];
		cp = hall.areas[z].coords.points.map(function(item) {

			var temp = Math.abs(xc - item.x);

			// find longest coordinates
			temp = Math.abs(xc - item.x);
			xl = temp > xl ? temp : xl;
			temp = Math.abs(yc - item.y);
			yl = temp > yl ? temp : yl;
			
			// store central points
			hall.areas[z].coords.points_rel.push({x : item.x - xc, y : item.y - yc});
		}); 

		// detect how many times original poligon can be enlarged
		svg_mapping.css("width",svg_width+100);
		svg_mapping.css("height",svg_height+100);

		// get max scalability, calculate based on screen viewport
		var max_x = (svg_width/2) / xl;
		var max_y = (svg_height/2) / yl;
		max_times = max_x < max_y ? max_x : max_y; 

		// generate scaled polygon points
		max_x = 0; max_y = 0;
		var max_x_prev = 0, max_y_prev = 0, max_first = true;
		var polygonPointsAttrValue = hall.areas[z].coords.points_rel.map(function(item) {

			var px = item.x * max_times + (svg_width/2);
			var py = item.y * max_times + (svg_height/2);

			if ( !max_first ){
				max_x += max_x_prev * item.y * max_times;
				max_y += max_y_prev * item.x * max_times;
			}

			max_x_prev = item.x * max_times;
			max_y_prev = item.y * max_times;

			max_first = false;
			return `${px+100} ${py+20}`;
		}).join(' ');

		// generate DOM elements
		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', polygonPointsAttrValue);
		polygon.style.opacity = parseInt(numOpacity2)/100;
		
		g.appendChild(polygon);
		svg_mapping.append(g);

		// calculate polygon square footage https://www.wikihow.com/Calculate-the-Area-of-a-Polygon
		var sf = Math.round(Math.abs(max_y - max_x)) / 2;

		// generate seats with accordance to square footage size
		var tws = 0, tns = 0, bg = "";
		if (hall.areas[z].seats){

			// zone custom background
			bg = (hall.areas[z].seats.bg === undefined)?"":hall.areas[z].seats.bg;

			// total seats per zone
			tws = hall.areas[z].seats.tws;

			// total passes per zone
			tns = hall.areas[z].seats.tns;

			// load custom bg if any
			if(bg.length > 0){
				svg_mapping.css('background-image', 'url('+bg+')');
				svg_mapping.css('background-position', 'center');
			
				// svg_mapping.css('background-size', (max_px - min_px) + 'px auto');
				svg_mapping.css('background-size', '100% auto');
				svg_mapping.css('background-repeat', 'no-repeat');
			}else{
				svg_mapping.css('background-image', 'none');
			}

			// seat size
			var height = Math.sqrt(sf / tws);
			if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
			var height_slider = hall.areas[z].seats.height;
			height *= (parseInt(height_slider) / 100);

			var li = "";
			var s = 0;
			let isRowLabeled = [];
			let isColLabeled = [];

			while (s < tws){

				// seat default coordinates
				var x = 0;
				var y = 0;

				// prevent undefined js error
				if ( !hall.areas[z].seats.points ) hall.areas[z].seats.points = [];

				// get mapped seat coordinates and align them accordingly
				if ( hall.areas[z].seats.points[s] ){

					x = (hall.areas[z].seats.points[s].x) * max_times + (svg_width/2);
					y = (hall.areas[z].seats.points[s].y) * max_times + (svg_height/2);
				}

				// get seat HTML
				var seat = structSeat(hall, z, s, height, x, y);

				let foundRow = isRowLabeled.find((item) => item.row == hall.areas[z].seats.points[s].r)
				let foundCol = isColLabeled.find((item) => item.col == hall.areas[z].seats.points[s].t)

				if(!foundRow){
					let label = setLabels(x-100,y+3,`FILA ${hall.areas[z].seats.points[s].r >= 10 ? hall.areas[z].seats.points[s].r : `0${hall.areas[z].seats.points[s].r}`}`)
					svg_mapping.append(label);
					isRowLabeled.push({row:hall.areas[z].seats.points[s].r,labeled:true})
				}
				
				if(!foundCol){
					let label = setLabels(`${hall.areas[z].seats.points[s].t >=10 ? x-10 : x-6}`,y-40,hall.areas[z].seats.points[s].t)
					svg_mapping.append(label);
					isColLabeled.push({col:hall.areas[z].seats.points[s].t,labeled:true})
				}

				// add seat to hall layout canvas
				seat.g.obj = this;
				svg_mapping.append(seat.g);
				s++;
			}

			// zone passes
			if (tws == 0 && tns > 0){

				svg_number_cont.fadeIn(0);
				svg_mapping_cont.fadeOut(0);

				$(".picker_select").attr("id","c0z"+z);

			// zone seats
			}else{

				svg_number_cont.fadeOut(0);
				svg_mapping_cont.fadeIn(0);
			}
		}

		// remove seat variation picker if present
		$("body").removeClass('pvarshow');

		// close zone selection | keep selected seats
		$("#seat_mapping_close").on("click", function(){

			$("#seat_mapping").fadeOut();
			$(".seat_mapping_temp").remove();
			current_zone_id = -1;
		});

		// close zone selection | cancel selected seats
		$("#seat_mapping_cancel").on("click", function(){

			if(tickets_global.length==0){

				$("#seat_mapping").fadeOut();
				$(".seat_mapping_temp").remove();
				current_zone_id = -1;
				return;
			}

			var l = confirm($(khl).data('cancelsel'));
			if(l){

				$("#seat_mapping").fadeOut();
				$(".seat_mapping_temp").remove();
				current_zone_id = -1;
				tickets_global = []; refreshSelectedTicket(tickets_global, hall, -1, -1);
				return;
			}
		});

		// init seat click listeners
		seatListeners(hall);

		// preload default selections
		refreshSelectedTicket(tickets_global, hall, z, -1);

		// mark reserved seats
		markBookings(hall, z);

		// scroll button listeners
		$(".kp-prev").on("click",function(){ $('#svg_mapping_cont').animate( { scrollLeft: '+=180' }, 500); });
		$(".kp-next").on("click",function(){ $('#svg_mapping_cont').animate( { scrollLeft: '-=180' }, 500); });
	}

	// seat click listeners
	function seatListeners(hall){

		// make sure reservations are loaded
		setTimeout(function(){

			// double click listener for admins only
			$(".cr, .tx").off("dblclick");
			var justdblclick = false;
			if($(khl).data('admin')) $(".cr, .tx").on("dblclick", function(){

				if(justdblclick) return;
				justdblclick = true;

				var ticket_id = $(this).attr("id").substr(1);

				var z = parseInt($(this).data("zone"));
				var s = $(this).data("index");

				// cancel reservation
				if($("#c"+ticket_id).hasClass("booked")){

					var l = confirm("Admin mode. Cancel this reservation?");
					if(l){ setBooking(z+"_"+ticket_id, "clear"); } // $("#c"+ticket_id).removeClass("booked");

				// mark as reserved
				}else{

					var l = confirm("Admin mode. Mark as reserved?");
					if(l){ setBooking(z+"_"+ticket_id, "book"); } //$("#c"+ticket_id).addClass("booked");
				}
				setTimeout(function(){ justdblclick = false; }, 1000);
			});

			// single click listener
			$(".cr, .tx").off("click");
			$(".cr, .tx").on("click", function(){

				if(pending_reservations) return;

				// hide price variation cont
				$("body").removeClass('pvarshow');

				var ticket_id = $(this).attr("id").substr(1);

				var z = parseInt($(this).data("zone"));
				var s = $(this).data("index");

				// double click listener for admins to cancel reservations
				if($("#c"+ticket_id).hasClass("booked"))
					return;

				
				// check for variations
				if(!hall.pcfs) hall.pcfs = [];
				let pcfshtml = '';
				for(let pv of hall.pcfs){

					if(hall.areas[z].seats['pcf'+pv.index]) pcfshtml += '\
					<li>\
						<input value="'+hall.areas[z].seats['pcf'+pv.index]+'" data-label="'+pv.label+'" type="radio" id="pvar-'+pv.index+'" name="selector">\
						<label for="pvar-'+pv.index+'">' + pv.label + ' (' + formatPrice(hall.areas[z].seats['pcf'+pv.index]) + ') </label>\
						<div class="check"></div>\
					</li>';
					
					// console.log(hall.areas[z].seats['pcf'+pv.index]);
				}

				// load price variation picker
				if(pcfshtml){

					// seats mode without zone popup
					if(renderType == 0){
								
						$("#variation_cont ul.pvar").html(pcfshtml);

						// assign variation listeners
						$("#variation_cont ul.pvar input[type=radio]").change(function() {

							doSeatSelection(hall, ticket_id, z, s, this.value, this.dataset.label);
						});

						// cancel variable reservation if currently reserved
						if($("#c"+ticket_id).hasClass("reserved")){ doSeatSelection(hall, ticket_id, z, s, '', ''); }else{ $("body").addClass('pvarshow'); }
					
					// seats mode with zone popup
					}else{
						
						$("#variation_cont_zone ul.pvar").html(pcfshtml);

						// assign variation listeners
						$("#variation_cont_zone ul.pvar input[type=radio]").change(function() {

							doSeatSelection(hall, ticket_id, z, s, this.value, this.dataset.label);

							$("#variation_cont_zone").fadeOut();
						});

						$("#variation_cont_zone").fadeIn();

						// user asks to close
						$(".var_toolbar_close .times").click(function() { $("#variation_cont_zone").fadeOut(); });
					}

				}else{

					doSeatSelection(hall, ticket_id, z, s, '', '');
				}

				// mark reserved seats
				markBookings(hall, z);
	
			});

			// number pick listener
			$( ".picker_select" ).change(function() {

				var ticket_id = $(this).attr("id").substr(1);
				// var ofst = parseInt($(this).attr("data-ofst")); // offset of reserved tickets
				var ofst = parseInt($(".picker_select option:selected").attr("data-ofst"));
				var z = ticket_id.split("z")[1];
				var s = 0;
				var tns = parseInt(hall_js.areas[z].seats.tns);

				// reset previous selection for this zone
				console.log("ofst"+ofst);
				// console.log(hall_js.areas[z].passes);
				hall_js.areas[z].passes.map(function(pass, index) {

					if(pass.uid == myticketUserId && pass.class == "reserved"){

						hall_js.areas[z].passes[index].uid = "";
						hall_js.areas[z].passes[index].class = "";
						tickets_global = jQuery.grep(tickets_global, function(value) {

							// clear everything under this zone
							return (value.zone_id != z); //  && value.ticket_pass != "pass"

							// console.log("removing" + value.ticket_id + " - " + hall_js.areas[z].passes[index].id);
							// return !(value.ticket_id == parseInt(index + ofst)+"z"+z);
							// return !(value.ticket_id == hall_js.areas[z].passes[index].id.substr(1));
						});
					}
				});

				// mark first selected number of seats as reserved
				var ti = parseInt($(this).val());
				var i = 0;
				hall_js.areas[z].passes.map(function(pass, index) {

					if(pass.uid == "" && pass.class == "" && i < ti){

						hall_js.areas[z].passes[index].uid = myticketUserId;
						hall_js.areas[z].passes[index].class = "reserved";

						var ticket_text = parseInt(i)+1;
						var ticket_row = '', ticket_price = '';
						var zone_text = hall.areas[z].seats.title;

						if(hall.areas[z].seats.price)
							ticket_price = hall.areas[z].seats.price;

						if(ticket_row=='') ticket_row = zone_text;

						// structure ticket object 
						// var ticket_obj = { zone_id: z, zone_text: zone_text, ticket_id: pass.id.substr(1), ticket_text: ticket_text, ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, type: "pass" };
						var ticket_obj = { zone_id: z, zone_text: zone_text, ticket_id: parseInt(index + ofst)+"z"+z, ticket_text: ticket_text, ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, ticket_type: "pass", type: "pass" };

						// pass additional data to the ticket object such as price, custom fields, seat information 
						Object.keys(hall.areas[z].seats).map(function(key, index) {
							
							// exclude seats key as it contains large data sets of unrelated data
							if(!exclude.includes(key)){ ticket_obj[key] = hall.areas[z].seats[key]; }
						});

						ticket_obj['price'] = ticket_price;

						tickets_global.push(ticket_obj);

						i++;
					}
				});

				console.log(tickets_global);

				// refresh top bar tickets
				refreshSelectedTicket(tickets_global, hall, z, ticket_id);

				// mark reserved seats
				markBookings(hall, z);
			});

			$("#kp_image").animate({opacity: '100%'}, 300);

			firstLoad = 50;

		},firstLoad);
	}

	// finalize seat selection immediately after click or after price variation is selected
	function doSeatSelection(hall, ticket_id, z, s, p, t){

		// add ticket
		if(!$("#c"+ticket_id).hasClass("reserved")){

			if(tickets_global.length>parseInt($(khl).data("ticketspbooking"))){
				alert($(khl).data("ajax_max_tickets"));
				return;
			}

			var ticket_text = parseInt(s) + 1;
			var ticket_row = '', ticket_price = '';
			var zone_text = hall.areas[z].seats.title;

			if(hall.areas[z].seats.points[s].t)
				ticket_text = hall.areas[z].seats.points[s].t;
				
			if(hall.areas[z].seats.points[s].r)
				ticket_row = hall.areas[z].seats.points[s].r;

			if(hall.areas[z].seats.price)
				ticket_price = hall.areas[z].seats.price;

			if(hall.areas[z].seats.points[s].p)
				ticket_price = hall.areas[z].seats.points[s].p;

			if(ticket_row=='') ticket_row = zone_text;
			if(p!='') ticket_price = p;

			// structure ticket object 
			var ticket_obj = {zone_id: z, zone_text: zone_text, ticket_id: ticket_id, ticket_text: ticket_text + (t ? ' ('+t+') ':''), ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, ticket_type: "seat", type: "seat" };

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map(function(key, index) {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!exclude.includes(key)){ ticket_obj[key] = hall.areas[z].seats[key]; }
			});

			ticket_obj['price'] = ticket_price;

			tickets_global.push(ticket_obj);

			// hide price variation cont
			$("body").removeClass('pvarshow');

		// remove ticket
		}else{

			$("#c"+ticket_id).removeClass("reserved");
			tickets_global = jQuery.grep(tickets_global, function(value) {
				return !(value.ticket_id == ticket_id);
			});
		}

		// refresh top bar tickets
		refreshSelectedTicket(tickets_global, hall, z, ticket_id);
	}

	function setLabels(x,y,label){
		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute('x', x);
		text.setAttribute('y', y);
		text.innerHTML = label;
		g.appendChild(text);
		return g;
	}

	// construct visual seat HTML code 
	function structSeat(hall, z, i, height, x, y){

		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('id', "dc"+i);
		g.setAttribute('data-index', i);

		var circle = document.createElementNS('http://www.w3.org/2000/svg', seatShape);
		circle.setAttribute('id', "c"+i+'z'+z);
		circle.setAttribute('class', "cr");
		circle.setAttribute('data-index', i);
		circle.setAttribute('data-zone', z);
		circle.setAttribute('style', 'opacity:'+(numOpacity/100)+';');

		switch(seatShape){

			case 'circle':
				circle.setAttribute('r', height/2);
				// set coordinates
				circle.setAttribute('cx', x);
				circle.setAttribute('cy', y);
			break;
			case 'rect':
				circle.setAttribute('width', height);
				circle.setAttribute('height', height);
				// set coordinates
				circle.setAttribute('x', x-height/2);
				circle.setAttribute('y', y-height/2);
			break;
		}

		var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttribute('id', "t"+i+'z'+z);
		text.setAttribute('dy', ".3em");
		text.setAttribute('stroke-width', "0px");
		text.setAttribute('text-anchor', "middle");
		text.setAttribute('stroke', "#000");
		if(hideNumbers==1){ text.setAttribute('class', "tx dn"); }else{ text.setAttribute('class', "tx"); }
		text.setAttribute('data-index', i);
		text.setAttribute('data-zone', z);
		text.setAttribute('style', "font-size:"+snSize+"px");

		// set coordinates
		text.setAttribute('x', x);
		text.setAttribute('y', y);

		text.setAttribute('data-toggle', "popover");
		text.setAttribute('title', "Seat Settings");
		text.setAttribute('data-content', "test");

		// text.innerHTML = i+1;

		// set custom assigned seat number
		if(hall.areas[z].seats.points[i] !== undefined) {
			if(hall.areas[z].seats.points[i]) {
				if(hall.areas[z].seats.points[i].t) {
					// text.innerHTML = hall.areas[z].seats.points[i].t;
				}
			}
		}
		
		g.appendChild(circle);
		g.appendChild(text);

		return {g:g, circle:circle, text:text};
	}

	function markBookings(hall, zone_id){

		// mark booked seats for current zone
		$(".cr").removeClass("booked");
		zone_id = current_zone_id;

		// switch layout rendering scenarious
		switch(renderType){

			// seat mode - mark booked seats
			case 1:

				var cp = hall_js.areas.map(function(item, z) {

					// map seats
					var tws = 0;
					if (hall.areas[z].seats){
			
						// total seats per zone
						tws = hall.areas[z].seats.tws;
			
						var s = 0;
						while (s < tws){

							var ticket_id = s+'z'+z;
							if(reservations[z+'_'+ticket_id]){
		
								if(reservations[z+'_'+ticket_id]["user"]!=myticketUserId && reservations[z+'_'+ticket_id]["type"]>0){
			
									// mark as booked visually
									$("#c"+ticket_id).addClass("booked");
									$("#t"+ticket_id).addClass("booked");
								}
							}
							s++;
						}

					}
				});

			break;

			// zone mode - mark booked seats
			case 0:

				var tws = 0, tns = 0;
				if (hall.areas[zone_id])
				if (hall.areas[zone_id].seats){
					
					tws = hall.areas[zone_id].seats.tws;
					tns = hall.areas[zone_id].seats.tns;
					var i = 0, bi = 0;

					// seats
					while (i < tws){
		
						var ticket_id = i+'z'+zone_id;
						if(reservations[zone_id+"_"+ticket_id]){
		
							if(reservations[zone_id+"_"+ticket_id]["user"]!=myticketUserId && reservations[zone_id+"_"+ticket_id]["type"]>0){
		
								// mark as booked visually. Ex id: 0_0z0 (if type is a seat)
								$("#c"+i+"z"+zone_id).addClass("booked");
								$("#t"+i+"z"+zone_id).addClass("booked");
							}
						}
						i++;
					}

					// passes
					i = 0;
					while (i < tns){

						var ticket_id = i+'z'+zone_id;
						if(reservations[zone_id+"_"+ticket_id]){

							if(reservations[zone_id+"_"+ticket_id]["ticket_type"]=="pass"){
							// if(reservations[zone_id+"_"+ticket_id]["user"]!=myticketUserId && reservations[zone_id+"_"+ticket_id]["type"]>0){
		
								bi++;

								// mark passes as reserved (if type is a pass)
								if(typeof(hall_js.areas[zone_id].passes[i]) !== 'undefined'){
									
									// console.log("marked as booked"+bi);
									hall_js.areas[zone_id].passes[i].class = "booked";
								}
							}
						}
						i++;
					}

					// refresh number picker
					// console.log("has class:" + $(".picker_select").hasClass('rendered'));
					
					// update select picker once
					if(bi_prev != bi || !bi_prev) if(tws == 0 && tns > 0){
						
						var p = 0, picker = "";
						// var pass_count = $( ".picker_select" ).val();
						while(p <= (i - bi) && p <= parseInt($(khl).data("ticketspbooking"))){

							picker += '<option value="'+p+'" data-ofst='+bi+'>'+p+'</option>';
							p++;
						}

						$(".picker_select").html(picker);

						// currently reserved tickets per zone
						var pass_count = jQuery.grep(tickets_global, function(value) {
							return parseInt(value.zone_id) == zone_id && value.ticket_type == "pass";
						});

						// console.log(tns + " - " + bi  + " - " + pass_count.length)
						// console.log("pass_count "+pass_count)

						// render
						$(".picker_select").val(pass_count.length);
						$(".picker_select").addClass('rendered');
					}

					// update remaining ticket amount in live on second loop
					if(tws == 0 && tns > 0){

						// currently reserved tickets per zone
						var pass_count = jQuery.grep(tickets_global, function(value) {
							return parseInt(value.zone_id) == zone_id && value.ticket_type == "pass";
						});

						// render
						$(".seat_head .row1").html("<b>Zona: " + hall.areas[index].seats.title + " - Precio: $" + hall.areas[index].seats.price + "</b>" + " &nbsp;" + (tns-bi-pass_count.length)+" "+$(khl).data("tickets_left"));
					}

					bi_prev = bi;
				}
		
				// mark booked/reserved zones
				for (var i = 0; i < hall.areas.length; i++) {
		
					var tws = 0, tns = 0;
					if (hall.areas[i].seats){
						tws = hall.areas[i].seats.tws;
						tns = hall.areas[i].seats.tns;

						// get booked tickets

						// var booked = jQuery.grep(Object.keys(reservations), function(value) {
						// 	// console.log(value);
						// 	return value.split("_")[0] == i && reservations[value]["type"]>0;
						// });

						// get reserved tickets
						var reserved = jQuery.grep(tickets_global, function(value) {
							return value.zone_id == i
						});

						// set defaults
						$("#pl"+i).removeClass("booked").removeClass("selected");

						// zone fully reserved
						if(reserved.length == tws+tns) $("#pl"+i).addClass("selected");
						
						// zone fully booked
						// if(booked.length == tws+tns) $("#pl"+i).addClass("booked");
						if(typeof(reservations_zones[i]) !== 'undefined')
						if(parseInt(reservations_zones[i].count) == tws+tns) $("#pl"+i).addClass("booked");
					}
				}
			break;
		}
	}

	function refreshSelectedTicket(tickets, hall, index, ticket_id){

		createCookie("tickets_"+$(khl).data("id"), JSON.stringify(tickets),1);
		$(".selected_seats").html("");

		var kp_ticket_rows = '';
		var pass_count = 0;
		var output = tickets.map(function(item) {

			var ticket_row = (item.ticket_row)?item.ticket_row:hall.areas[item.zone_id].seats.title;
			var ticket_price = (item.ticket_price)?item.ticket_price:$(khl).data('price');
			var ticket_id = item.ticket_id;
			var ticket_text = item.ticket_text;
		
			// available summary table key value fields 
			var summary_table_fields = {}
			Object.keys(hall_js.areas[item.zone_id].seats).map(function(key, index) { if(!exclude.includes(key)){ summary_table_fields['{{ticket_'+key+'}}'] = hall.areas[item.zone_id].seats[key]; } });

			// console.log(summary_table_fields);
			switch(item.type){

				case 'seat':

					if(!hall.areas[item.zone_id].seats) return "";
		
					if(hall.areas[item.zone_id].seats.points[ticket_id]){
		
						// override seat text
						if(hall.areas[item.zone_id].seats.points[ticket_id].t)
							ticket_text = hall.areas[item.zone_id].seats.points[ticket_id].t;
		
						// override seat row
						if(hall.areas[item.zone_id].seats.points[ticket_id].r)
							ticket_row = hall.areas[item.zone_id].seats.points[ticket_id].r;
		
						// override seat price
						if(hall.areas[item.zone_id].seats.points[ticket_id].p)
							ticket_price = parseFloat(hall.areas[item.zone_id].seats.points[ticket_id].p);
					}else{
		
		
					}
		
					// summary table field mapping
					var fields = Object.assign(summary_table_fields, {'{{ticket_text}}':ticket_text, '{{ticket_zone_title}}':hall.areas[item.zone_id].seats.title, '{{ticket_row}}':ticket_row, '{{ticket_price}}':formatPrice(ticket_price), '{{ticket_id}}':ticket_id, '{{ticket_zone_id}}':item.zone_id});

					var summary_table_row = summary_table;

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

					$("#c"+ticket_id).addClass("reserved");
		
					// return only previewd zone seats
					if(ticket_price.length>0) if(index == item.zone_id) return ticket_text+" / "+formatPrice(ticket_price)+" &nbsp;&nbsp;&nbsp;";
					if(index == item.zone_id) return ticket_text+ " &nbsp;&nbsp;&nbsp;";
					
				break;
				case 'pass':

					if(!hall.areas[item.zone_id].seats) return "";

					var tns = hall.areas[item.zone_id].seats.tns;
		
					// summary table field mapping
					var fields = Object.assign(summary_table_fields, {'{{ticket_text}}':ticket_text, '{{ticket_zone_title}}':hall.areas[item.zone_id].seats.title, '{{ticket_row}}':'-', '{{ticket_price}}':formatPrice(ticket_price), '{{ticket_id}}':ticket_id, '{{ticket_zone_id}}':item.zone_id});
					
					var summary_table_row = summary_table;

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

					// kp_ticket_rows += '\
					// <tr class="select-seat">\
					// 	<td>'+hall.areas[item.zone_id].seats.title+'</b></span>\
					// 	<span class="m-row">-</b></span>\
					// 	<span class="m-row">'+formatPrice(ticket_price)+' '+$(khl).data('perseat')+'</span>\
					// 	</td>\
					// 	<td>-</td>\
					// 	<td>'+formatPrice(ticket_price)+' <span>'+$(khl).data('perseat')+'</span></td>\
					// 	<td data-zone="'+item.zone_id+'" data-index="'+ticket_id+'" class="kp-rem-seat">&times;</td>\
					// </tr>';

					// mark as reserved
					var pass_id = ticket_id.split("z")[0];

					if(isNaN(pass_id)) break;

					// make sure record exists
					if(hall_js.areas[item.zone_id].passes === undefined){
						hall_js.areas[item.zone_id].passes = [];
						hall_js.areas[item.zone_id].passes.push({id: "p1z"+item.zone_id, uid: "", class: ""});
					}

					console.log("pass_id "+pass_id);

					// mark pass as reserved
					hall_js.areas[item.zone_id].passes[pass_id].uid = myticketUserId;
					hall_js.areas[item.zone_id].passes[pass_id].class = "reserved";
					
					// count total pass selected
					pass_count++;

					// return only previewed zone seats
					if(ticket_price.length>0) if(index == item.zone_id) return ticket_text+" / "+formatPrice(ticket_price)+" &nbsp;&nbsp;&nbsp;";
					if(index == item.zone_id) return ticket_text+ " &nbsp;&nbsp;&nbsp;";

				break;
			}
		});

		if(kp_ticket_rows==''){
			$(".kp-btn-reserve,.kp-table").fadeOut(0);
		}else{
			$(".kp-btn-reserve,.kp-table").fadeIn();
		}

		// update picker count
		$( ".picker_select" ).val(pass_count);

		// trim last space and coma 
		// if(output.length>1){  output = output.substring(0, output.length-2); }
		if(typeof(hall.areas[index]) !== 'undefined') $(".seat_head .row1").html("<b>Zona: " + hall.areas[index].seats.title + " - Precio: $" + hall.areas[index].seats.price + "</b>");
		$(".selected_seats").html(output);

		if(output==""){$(".sel_texts").fadeOut(0);}else{$(".sel_texts").fadeIn(0);}
		$(".kp-ticket-row").html(kp_ticket_rows);
		$(".kp-ticket-row").css('display', 'block');

		// refresh listeners
		$(".kp-rem-seat").on("click", function(){

			var indexx = $(this).data("index");
			var zone = $(this).data("zone");

			$("#c"+indexx).removeClass("reserved");
			tickets_global = jQuery.grep(tickets, function(value) {
				return !(value.ticket_id == indexx && value.zone_id == zone);
			});

			refreshSelectedTicket(tickets_global, hall, indexx, -1);
		}); 
	}

	// format price according to woo standards
	function formatPrice(price){

		if(price.length==0) return "";
		var symb = $(khl).data('cur_symb');
		switch ( $(khl).data('cur_pos') ) {
			case 'left': return symb + price; break;
			case 'right': return price + symb; break;
			case 'left_space': return price + '&nbsp;' + symb; break;
			case 'right_space': return symb + '&nbsp;' + price; break;
		  }
	}

	function setBooking(seat_id, action) {

		// perform ajax request
	    $.ajax({
			type: 'POST',
			dataType: 'json',
			url: $(khl).data("ajax"),
			data: {
				'id': $(khl).data("id"),
				'time': $(khl).data("time"),
				'seat_id': seat_id,
				'baction': action,
				'zone_id': current_zone_id,
				'user_id': myticketUserId,
				'action': 'myticket_events_set_booking'
			},
			beforeSend : function () {

			},
			success: function (data) {
				var $data = $(data);
				if ($data.length) {

					if(data.success){

						checkReservations();
					}else{
						
						alert("Can not save:" + data.reason);
					}
				}
			},
			error : function (jqXHR, textStatus, errorThrown) {

				alert($(khl).data('ajax_error'));  
			},
		});
	}

	var setReservationsLoad = false;
	function setReservations() {

		// prevent double clicks
		if(setReservationsLoad) return;
		setReservationsLoad = true;

		// perform ajax request
	    $.ajax({
			type: 'POST',
			dataType: 'json',
			url: $(khl).data("ajax"),
			data: {
				'id': $(khl).data("id"),
				'time': $(khl).data("time"),
				'action': 'myticket_events_set_reservations',
				'tickets': tickets_global,
				'user_id': myticketUserId
			},
			beforeSend : function () {

			},
			success: function (data) {

				var $data = $(data);
				if ($data.length) {

					if(data.success){
						
						// check if all reservations were successfull 
						if(data.notreserved){

							alert($(khl).data('ajax_booked'));

							for (var i = 0; i < data.notreserved.length; i++){
								tickets_global = jQuery.grep(tickets_global, function(value) {
									return !(value.zone_id +"_"+ value.ticket_id == data.notreserved[i]);
								});
							} 

							refreshSelectedTicket(tickets_global, hall_js, -1, -1);
							
							// immidiately refresh current list
							checkReservations();
							
							setReservationsLoad = false;
						}else{

							// finalize reservation by adding to cart
							fetch("?wc-ajax=add_to_cart", {
								body: 'product_id='+$(khl).data("id")+'&quantity='+tickets_global.length+'&product_sku=',
								method: "post",
								headers: {
									'Accept': 'application/json',
									'Content-type': 'application/x-www-form-urlencoded'
								}
							})
							.then(response => response.json())
							.then(response => {

								setReservationsLoad = false;
								location.href = $(khl).attr('data-carturl');
							})
							.catch(error => {

								setReservationsLoad = false;
								console.error('Error:', error);
							});
						}

					}else{

						alert($(khl).attr('data-ajax_error')+" "+(data.reason)?data.reason:"");  
					}

				}else{
		
				}
			},
			error : function (jqXHR, textStatus, errorThrown) {

				setReservationsLoad = false;
				alert($(khl).data('ajax_error'));  
			},
		});
	}

	function checkReservations() {

	    // perform ajax request
	    $.ajax({
			type: 'POST',
			dataType: 'json',
			url: $(khl).data("ajax"),
			data: {
				'id': $(khl).data("id"),
				'time': $(khl).data("time"),
				'zone_id': current_zone_id,
				'user_id': myticketUserId,
				'render_type': renderType,
				'action': 'myticket_events_get_reservations',
			},
			beforeSend : function () {

			},
			success: function (data) {
				var $data = $(data);
				if ($data.length) {

					if(data.success){

						pending_reservations = false;
						reservations = data.data;
						reservations_zones = data.data_zones;
						markBookings(hall_js, current_zone_id);

						// init seat click listeners after first load
						if(renderType==1 && firstLoad==60){ console.log('seatListeners'); seatListeners(hall_js); }
					}
				
				} 
			},
			error : function (jqXHR, textStatus, errorThrown) {

				pending_reservations = false;
			},
		});
		return false;
	}

	function makeid() {

		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 5; i++)
		  text += possible.charAt(Math.floor(Math.random() * possible.length));
	  
		return text;
	}

	function createCookie(name, value, days) {
		var expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		} else {
			expires = "";
		}
		document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
	}

	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
		  var c = ca[i];
		  while (c.charAt(0) == ' ') {
			c = c.substring(1);
		  }
		  if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		  }
		}
		return "";
	}

});