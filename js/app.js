"use strict";
/* SOME CONSTANTS */
let endpoint01 = "https://misdemo.temple.edu/auth";
localStorage.usertoken = 0;
localStorage.lastnavlink = "";
let endpoint02 = "https://mis3502-islam.com/8211";
localStorage.usertoken = 0;
localStorage.lastnavlink = "";

/* SUPPORTING FUNCTIONS */

let navigationControl = function(the_link) {
    /* manage the content that is displayed */

    let idToShow = $(the_link).attr("href");
    localStorage.lastnavlink = idToShow;
    console.log(idToShow);

    if (idToShow == "#div-login") {
        /* what happens if the login/logout link is clicked? */
        localStorage.usertoken = 0;
        $(".secured").addClass("locked");
        $(".secured").removeClass("unlocked");
    }

    $(".content-wrapper").hide(); /* hide all content-wrappers */
    $(idToShow).show(); /* show the chosen content wrapper */
    $("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
    $(".navbar-collapse").collapse(
        "hide"
    ); /* explicitly collapse the navigation menu */
};

/* end navigation control */

//call this function when the login button is clicked

let loginController = function() {
    //go get the data off the login form
    let the_serialized_data = $("#form-login").serialize();
    //the data I am sending
    console.log(the_serialized_data);
    let url = endpoint01;
    $.getJSON(url, the_serialized_data, function(data) {
        //the data I got back
        console.log(data);
        if (typeof data === "string") {
            localStorage.usertoken = 0; // login failed.  Set usertoken to it's initial value.
            $("#login_message").html(data);
            $("#login_message").show();
        } else {
            $("#login_message").html("");
            $("#login_message").hide();
            localStorage.usertoken = data["user_id"]; //login succeeded.  Set usertoken.
            $("#usertoken").val("");
            $("#usertoken").val(data["user_id"]);
            $(".secured").removeClass("locked");
            $(".secured").addClass("unlocked");
            $("#div-login").hide();
            $("#div-main").show();
            $("#usertoken").hide();
            $("#choice").hide();
        }
    });
    //scroll to top of page
    $("html, body").animate({ scrollTop: "0px" });
};

//document ready section
$(document).ready(function() {
    /* ------------------  basic navigation ----------------*/
    /* lock all secured content */
    $(".secured").removeClass("unlocked");
    $(".secured").addClass("locked");
    /* this reveals the default page */
    $("#div-login").show();
    /* this controls navigation - show / hide pages as needed */
    /* what to do when a navigation link is clicked */
    $(".nav-link").click(function() {
        navigationControl(this);
    });

    /* what happens if the login button is clicked? */
    $("#btnLogin").click(function() {
        loginController();
    });

    $("#my-weather-list-btn").click(function() {
        displayWeatherList();
    });

    $("#my-currency-list-btn").click(function() {
        displayConversions();
    });

    const convertCurrencyForm = document.querySelector(".convert-currency");
    const conversionResultsDiv = document.querySelector(".conversion-result");
    const apiKey = "TlhxQWJnZyKnliRf";
    let amount = "";
    let from = "";
    let to = "";

    convertCurrencyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        amount = e.target.querySelector("#amount").value;
        from = e.target.querySelector("#from").value;
        to = e.target.querySelector("#to").value;
        ConversionAPI();
    });

    async function ConversionAPI() {
        const baseURL = `https://v1.nocodeapi.com/marshall/cx/${apiKey}/rates/convert?amount=${amount}&from=${from}&to=${to}`;
        const response = await fetch(baseURL);
        const data = await response.json();
        console.log(data);
        ConversionHTML(data);
    }

    function ConversionHTML(results) {
        let ConversionHTML = "";

        ConversionHTML += `
          <div class="item currencybox">
            <div class="flex-container currencycontainer">
              <h1 data-currencytitle="${results["text"]}" class="currencytitle">${results["text"]}</h1>
      <button class="save-conversion-btn"  data-id=${results.result} href=""> Save Conversion </button>
            </div>
          </div>
        `;
        conversionResultsDiv.innerHTML = ConversionHTML;
    }

    $(".conversion-result").on("click", ".view-btn", function(event) {
        $(".search-result-for-add").hide();
        const id = $(this).data("id");
        viewCurrency(id);
    });

    $(".conversion-result").on("click", ".save-conversion-btn", function(event) {
        const id = $(this).data("id");
        var text = $(this)
            .closest(".item")
            .find(".currencytitle")
            .data("currencytitle");
        conversionList.addtoconversionList(text, id);
        alert("Conversion Saved!");
    });

    var conversionList = (function() {
        var currencies = []

        function Item(text, id) {
            this.text = text;
            this.id = id;
        }

        function saveCurrency() {
            sessionStorage.setItem("conversionList", JSON.stringify(currencies));
        }

        function loadCurrency() {
            currencies = JSON.parse(sessionStorage.getItem("conversionList"));
        }
        if (sessionStorage.getItem("conversionList") != null) {
            loadCurrency();
        }

        var obj = {};

        obj.addtoconversionList = function(text, id) {
            for (var item in currencies) {
                if (currencies[item].id === id) {
                    alert("Currency already added");
                }
            }
            var item = new Item(text, id);
            currencies.push(item);
            saveCurrency();
        };

        obj.removefromConversions = function(id) {
            for (var item in currencies) {
                var item = currencies[item];
                if (item.id === id) {
                    currencies.splice(item, 1);
                    saveCurrency();
                    return;
                }
            }
        };
        obj.removeAllCurrencies = function() {
            currencies = [];
            saveCurrency();
        };

        obj.listConversions = function() {
            var CurrencyCopy = [];
            for (var i in currencies) {
                var item = currencies[i];
                var itemCopy = {};
                for (var p in item) {
                    itemCopy[p] = item[p];
                }
                CurrencyCopy.push(itemCopy);
            }
            return CurrencyCopy;
        };
        return obj;
    })();

    $("#taskAlert").on("click", ".remove-currency", function(event) {
        event.preventDefault();
        var id = $(this).data("id");
        conversionList.removefromConversions(id);
        displayConversions();
    });

    function displayConversions() {
        var currencyArr = conversionList.listConversions();
        var output = "";
        currencyArr.map((currency) => {
            output += `<div class="conversionList">
<div class="ingr-details">
   <p>Today's Rates: ${currency.text}</p>
     </div>
<div class="ingr-actions">
    <button  class='remove-currency' data-id='${currency.id}'>Delete this Conversion</button>
  </div>
   </div>`;
        });
        $("#taskAlert").html(output);
    }
});
const lookupW = document.querySelector(".search-weather");
const searchResultDiv = document.querySelector(".search-result-for-weather");
const weatherResultDiv = document.querySelector(".weather-result-for-add");
const container = document.querySelector(".container");
let cityName = "";
const apiKey = "c819148a640aadac2f21e5c6afd21133";
lookupW.addEventListener("submit", (e) => {
    e.preventDefault();
    cityName = e.target.querySelector("input").value;
    weatherAPI();
});

async function weatherAPI() {
    const baseURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`;
    const response = await fetch(baseURL);
    const data = await response.json();
    const weatherObject = data.weather;
    let icon = "";
    let description = "";

    weatherObject.map((city) => {
        icon = city.icon;
        description = city.description;
    });
    let temp = Math.round(data.main["temp"]);
    const humidity = data.main["humidity"];
    const wind = data.wind["speed"];
    const cityname = data.name;
    const country = data.sys["country"];
    const id = data["id"];

    weatherHTML(
        id,
        country,
        cityname,
        wind,
        temp,
        description,
        icon,
        humidity
    );
}

function weatherHTML(
    id,
    country,
    cityname,
    wind,
    temp,
    description,
    icon,
    humidity
) {
    let weatherHTML = "";
    weatherHTML += `
      <div class="frame">
      <button class="save-city-btn"  data-id="${id}" href=""> Save City </button>
      <h4 data-city="${cityname}"class='city-name'>${cityname}</h4>
      <h4 class='country-name'  data-country="${country}">${country}</h4>
      <div class="center">
        <div class="icon-div">
          <img class="icon-box-div" data-image="${icon}" src="http://openweathermap.org/img/w/${icon}.png" alt="img">
        </div>
        <div class="clouds">
        </div>
        <div class="weather">
          <span data-temp="${temp}" class="temp">${temp} F </span>
          <div class="metrics">
            <span class="weather-description" data-desc="${description}"> Today is mostly ${description} </span>
            <table class="week-preview">
              <tr>
                <td>Humidity: </td>
                <td  class="humid-div" data-humid="${humidity}">${humidity} %</td>
              </tr>
              <tr>
                <td>Wind Speed: </td>
                <td class="wind-div" data-wind="${wind}">${wind} km/h</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    `;
    searchResultDiv.innerHTML = weatherHTML;
}

$(".search-result-for-weather").on("click", ".save-city-btn", function(event) {
    var icon = $(this).closest(".frame").find(".icon-box-div").data("image");
    var city = $(this).closest(".frame").find(".city-name").data("city");
    var humid = $(this).closest(".frame").find(".humid-div").data("humid");
    var temp = $(this).closest(".frame").find(".temp").data("temp");
    var wind = $(this).closest(".frame").find(".wind-div").data("wind");
    var country = $(this).closest(".frame").find(".country-name").data("country");
    var description = $(this)
        .closest(".frame")
        .find(".weather-description")
        .data("desc");
    var id = $(this).data("id");
    console.log(id);
    weatherList.addtoweatherList(
        icon,
        city,
        humid,
        temp,
        wind,
        description,
        country,
        id
    );
    event.preventDefault();
    displayWeatherList();
});

var weatherList = (function() {
    var weathers = [];

    function Item(icon, city, humidity, temp, wind, description, country, id) {
        this.id = id;
        this.humidity = humidity;
        this.temp = temp;
        this.wind = wind;
        this.description = description;
        this.city = city;
        this.icon = icon;
        this.country = country;
    }

    function saveWeather() {
        sessionStorage.setItem("weatherList", JSON.stringify(weathers));
    }

    function loadWeather() {
        weathers = JSON.parse(sessionStorage.getItem("weatherList"));
    }
    if (sessionStorage.getItem("weatherList") != null) {
        loadWeather();
    }

    var obj = {};

    obj.addtoweatherList = function(
        icon,
        city,
        humidity,
        temp,
        wind,
        description,
        country,
        id
    ) {
        for (var item in weathers) {
            if (weathers[item].id === id) {
                alert("City Weather Information already saved!");
            }
        }

        var item = new Item(
            icon,
            city,
            humidity,
            temp,
            wind,
            description,
            country,
            id
        );
        weathers.push(item);
        alert("City Weather Information saved");
        saveWeather();
    };

    obj.removefromWeathers = function(id) {
        for (var item in weathers) {
            var item = weathers[item];
            if (item.id === id) {
                weathers.splice(item, 1);
                saveWeather();
                return;
            }
        }
    };
    obj.removeAllweathers = function() {
        weathers = [];
        saveWeather();
    };

    obj.listWeather = function() {
        var weatherCopy = [];
        for (var i in weathers) {
            var item = weathers[i];
            var itemCopy = {};
            for (var p in item) {
                itemCopy[p] = item[p];
            }
            weatherCopy.push(itemCopy);
        }
        return weatherCopy;
    };
    return obj;
})();

$("#listSavedCities").on("click", ".remove-city", function(event) {
    event.preventDefault();
    var id = $(this).data("id");
    weatherList.removefromWeathers(id);
    displayWeatherList();
});

function displayWeatherList() {
    var cityArr = weatherList.listWeather();
    var output = "";
    cityArr.map((city) => {
        output += ` <div id="view-listed-cities">
      <button class="remove-city" data-id="${city.id}"> Remove </button>
      <h4 class='name-city'>${city.city}</h4>
      <h4 class='name-country'>${city.country}</h4>
      <div class="center-res">
        <div class="div-icon">
          <img class="box-icon-div" data-image="${city.icon}" src="http://openweathermap.org/img/w/${city.icon}.png" alt="img">
        </div>
        <div class="weather-listed-city-res">
          <span  class="temp">${city.temp} F </span>
          <div class="metrics">
            <span class="weather-description"> Today is mostly ${city.description} </span>
            <table class="week-preview">
              <tr>
                <td>Humidity:  </td>
                <td  class="humid-div" >${city.humidity}%</td>
              </tr>
              <tr>
                <td>Wind Speed:  </td>
                <td class="wind-div" > ${city.wind} km/h</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>`;
    });
    $("#listSavedCities").html(output);
}