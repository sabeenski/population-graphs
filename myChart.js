//selector
const dropdown = document.getElementById('countryNames');
console.log(dropdown);

var currentChart;
dropdown.addEventListener('change', fetchData);

async function fetchData() {
  var countryCode = dropdown.value;
  const indicatorCode = 'SP.POP.TOTL';
  const baseUrl = 'https://api.worldbank.org/v2/country/';
  const url =
    baseUrl + countryCode + '/indicator/' + indicatorCode + '?format=json';
  console.log('Fetching data from URL: ' + url);

  var response = await fetch(url);

  if (response.status == 200) {
    var fetchedData = await response.json();
    console.log(fetchedData);

    var data = getValues(fetchedData);
    var labels = getLabels(fetchedData);
    var countryName = getCountryName(fetchedData);
    renderChart(data, labels, countryName);
  }
}

function getValues(data) {
  var vals = data[1].sort((a, b) => a.date - b.date).map((item) => item.value);
  console.log('data', vals);
  return vals;
}

function getLabels(data) {
  var labels = data[1].sort((a, b) => a.date - b.date).map((item) => item.date);
  console.log('labels', labels);
  return labels;
}

function getCountryName(data) {
  var countryName = data[1][0].country.value;
  return countryName;
}

function renderChart(data, labels, countryName) {
  var ctx = document.getElementById('myChart').getContext('2d');

  if (currentChart) {
    // Clear the previous chart if it exists
    currentChart.destroy();
  }
  // Draw new chart
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Population, ' + countryName,
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      animation: {
        duration: 1000,
      },
    },
  });
}

// Show a list of country names that is fetched from API

async function fetchCountries() {
  // World bank API, fetch 400 per page, meaning that we get the whole country list
  const url = 'https://api.worldbank.org/v2/country?format=json&per_page=400';

  console.log('In fetchCountryList');
  var response = await fetch(url);

  try {
    if (!response.ok) {
      throw Error(response.statusText);
    } else {
      if (response.status == 200) {
        console.log('Got Countrylist response');
        var countryData = await response.json();
        countryList = countryData[1].sort(sortCountriesAlphabeticallyByName);
        addMenuItems(countryList);
      } else {
        console.log('Error with fetching country list');
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function addMenuItems(countryList) {
  countryList.map((country) => {
    // Skip aggregate areas such as "EU" and "EMU area"
    if (country.capitalCity === '') {
      return;
    }

    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode(country.name));
    opt.value = country.id;
    dropdown.appendChild(opt);
  });
}

function sortCountriesAlphabeticallyByName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
