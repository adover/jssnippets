$('form#register-form').submit(function(){
	var date = $('#registerDate').val(),
			month = $('#registerMonth').val(),
			year = $('#registerYear').val(),
			error = false,
			inputDate;

	if (date == '' || month == '' || year == '' || isNaN(date) || isNaN(month) || isNaN(year) || date < 1 || date > 31 || month < 1 || month > 12 || year < 1900 || year > 2015) {
		$('.dob-error').html("Please&nbsp;Complete").fadeIn('1000').show();

		return = false;
	}

	if(isValidDate(year, month, date)){
		// console.log("is valid");
	}else{
		$('.dob-error').html("Invalid date").fadeIn('1000').show();
		return = false;
	}

	inputDate = year + '-' + month + '-' + date;
	var age = getAge(inputDate);

	if (age < 18 ) {
		$('.dob-error').html("You must be over 18").fadeIn('1000').show();
		$("#registerDate").focus();
		return = false;
	}
});

function isValidDate(year, month, day) {
  var d = new Date(year, month-1), day);
  console.log(d);
  if (d.getFullYear() == year && d.getMonth() == month && d.getDate() == day) {
      return true;
  }
  return false;
}
