import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Keyboard, Image,ImageBackground, TouchableOpacity} from 'react-native';

const WeatherApp = () => {
  const [city, setCity] = useState('Colombo');  //defaulty display the colombo weather conditions
  const [weatherData, setWeatherData] = useState(null); 
  const [forecast, setForecast] = useState(null);  
  const [suggestions, setSuggestions] = useState([]);

  const getImageForWeather = (weatherCode) => {
    // Map weather condition codes to image sources
    switch (weatherCode) {
      case '01d': // clear sky day
        return { source: require('./assets/sun.png'), width: 150, height: 150 };
      case '01n': // clear sky night
        return { source: require('./assets/moon.png'), width: 150, height: 150 };
      case '02d': // few clouds day
      case '02n': // few clouds night
        return { source: require('./assets/cloudy.png'), width: 150, height: 150 };
      case '03d': // scattered clouds day
      case '03n': // scattered clouds night
        return { source: require('./assets/partly_cloudy.png'), width: 150, height: 150 };
      case '04d': // broken clouds day
      case '04n': // broken clouds night
        return { source: require('./assets/broken_cloudy.png'), width: 150, height: 150 };
      case '09d': // shower rain day
      case '09n': // shower rain night
        return { source: require('./assets/light_rain.png'), width: 150, height: 150 };
      case '10d': // rain day
      case '10n': // rain night
        return { source: require('./assets/rain.png'), width: 150, height: 150 };
      case '11d': // thunderstorm day
      case '11n': // thunderstorm night
        return { source: require('./assets/thunderstorm.png'), width: 150, height: 150 };
      case '13d': // snow day
      case '13n': // snow night
        return { source: require('./assets/snow.png'), width: 150, height: 150 };
      default:
        return { source: require('./assets/default.png'), width: 150, height: 150 }; // Default image if weather condition not found
    }
  };

  const fetchWeatherData = async () => {
    try {
      const apiKey = '28802a17941a972949c2c0e675f17de4'; //call the api key
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; //for the weather condition part
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`; //for the forecast part

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      if (weatherResponse.ok && forecastResponse.ok) {
        setWeatherData(weatherData);
        setForecast(forecastData.list);
      } else {
        if (weatherData.cod === '404' || forecastData.cod === '404') {
          console.error('City not found');
          setWeatherData(null);
          setForecast(null);
          // You might set an error message state to display to the user
          // if there is no city from that name, occur this erro message
        } else {
          console.error('Error fetching data:', weatherData.message || forecastData.message);
          setWeatherData(null);
          setForecast(null);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setWeatherData(null);
      setForecast(null);
    }
  };
  const fetchCitySuggestions = async (query) => {
    try {
      const apiKey = '28802a17941a972949c2c0e675f17de4';   //this for suggestion part
      const suggestionsUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

      const response = await fetch(suggestionsUrl);
      const data = await response.json();  

      if (response.ok) {
        return data.map((cityData) => ({
          name: cityData.name,
          country: cityData.country,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      return [];
    }
  };

  const handleSearch = () => {
    if (city !== '') {
      fetchWeatherData();
    }
  };
  useEffect(() => {
    fetchWeatherData(); // Fetch weather data for the default city (Colombo) on component mount
  }, []);

  const handleTextChange = async (text) => {
    setCity(text); // Update the 'city' state with the text entered by the user
  
    // Check if the entered text has a length greater than or equal to 3 characters
    if (text.trim().length >= 3) {
      try {
        const suggestedCities = await fetchCitySuggestions(text); // Fetch city suggestions based on the entered text
        setSuggestions(suggestedCities); // Set the fetched city suggestions in the 'suggestions' state
      } catch (error) {
        console.error('Error getting city suggestions:', error);
        setSuggestions([]); // If there's an error fetching suggestions, set suggestions to an empty array
      }
    } else {
      setSuggestions([]); // If the entered text is less than 3 characters, clear the suggestions
    }
  };
  return (
    <ImageBackground
      source={require('./assets/Cover5.png')} // image address
      style={styles.backgroundImage} // to Apply background image style
    >
    <View style={styles.container}>
      <View style={styles.searchContainer}>
      <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={city}
            onChangeText={handleTextChange}
            autoFocus
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchWeatherData}
            disabled={city.trim() === ''} //without any inputs can't click the search button
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          <ScrollView style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setCity(`${suggestion.name}, ${suggestion.country}`);
                setSuggestions([]); // Hide suggestions when a suggestion is selected
                fetchWeatherData(); // Fetch weather data for the selected city
                Keyboard.dismiss(); // Dismiss the keyboard after selection
              }}
            >
              <Text>{`${suggestion.name}, ${suggestion.country}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      

{weatherData && (
  <View
  style={{
    ...styles.weatherContainer,
  }}
>
  <Text style={styles.city}>{weatherData.name}, {weatherData.sys.country}</Text>
  <Image
    source={getImageForWeather(weatherData.weather[0].icon).source}
    style={{
      width: getImageForWeather(weatherData.weather[0].icon).width,
      height: getImageForWeather(weatherData.weather[0].icon).height,
      ...styles.weatherImage,
    }}
  />
  <Text style={styles.Temperature}>{weatherData.main.temp}°C</Text>
  <Text style={styles.description}>{weatherData.weather[0].description}</Text>
</View>
)}

{forecast && (
  <View>
    <Text style={styles.forecastTopic}>24-hours Forecast</Text>
    <ScrollView
  horizontal
  contentContainerStyle={{
    paddingHorizontal: 10,
    paddingTop: 490, // Adjust paddingTop as needed
    paddingBottom: 10,
  }}
  style={{ height: 180 }}
>
  {forecast.slice(1, 9).map((item, index) => {
    const date = new Date(item.dt_txt);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const weatherCode = item.weather[0].icon;

    const getWeatherImage = (weatherCode) => {
      switch (weatherCode) {
        case '01d':
          return require('./assets/sun.png');
        case '01n':
          return require('./assets/moon.png');
        case '02d':                                    //display images inside the conditional containers
        case '02n':
          return require('./assets/cloudy.png');
        case '03d':
        case '03n':
          return require('./assets/partly_cloudy.png');
        case '04d':
        case '04n':
          return require('./assets/broken_cloudy.png');
        case '09d':
        case '09n':
          return require('./assets/light_rain.png');
        case '10d':
        case '10n':
          return require('./assets/rain.png');
        case '11d':
        case '11n':
          return require('./assets/thunderstorm.png');
        case '13d':
        case '13n':
          return require('./assets/snow.png');
        default:
          return require('./assets/default.png');
      }
    };

    return (
      <View key={index} style={styles.weatherConditionContainer}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Image
          source={getWeatherImage(weatherCode)}
          style={{ width: 80, height: 80 }} // Adjust the width and height as needed
        />
        <Text style={styles.time}>{time}</Text>
        <View style={styles.weatherInfo}>
          <Text style={styles.temperature}>{item.main.temp}°C</Text>
          <Text style={styles.weatherDescription}>{item.weather[0].main}</Text>
        </View>
      </View>
    );
  })}
</ScrollView>
  </View>
)}
      {!weatherData && <Text style={styles.message}>Enter a city and press Search</Text>}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Adjust alpha value (0.5 for semi-transparent)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    position: 'absolute',
    width: '90%',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1, // Bring the input field forward
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'rgba(245, 245, 245, 0.6)',
    fontSize: 18, // Adjust text size
    borderWidth: 1,
  },
  
  weatherContainer: {
    position: 'absolute',
    top: 130, // Adjust the top position as needed
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    alignSelf: 'center', // Center the container within its parent
  },
  
  forecastContainer: {
    position: 'absolute',
    alignItems: 'center', // Center horizontally
    bottom: 10, // Adjust bottom position as needed
    left: 40,
    right: 40,
    padding: 5,
    borderRadius: 8,
    borderWidth: 2, // Add border width
    borderColor: '#000', // Add border color
    height: 200, // Adjust the height as needed
  },
  forecastTitle: {
    fontSize: 40, // Example font size
    fontWeight: 'bold', // Example font weight
    marginBottom: 10, // Example bottom margin
    color: '#333', // Example text color
  },
  city: {
    fontSize: 40, // Example font size
    fontWeight: 'bold', // Example font weight
    marginBottom: 10, // Example bottom margin
    color: '#000000',
    textAlign: 'center', // Center text horizontally
  },
  Temperature: {
    fontSize: 30, // Example font size
    fontWeight: 'normal', // Example font weight
    paddingTop: 10, 
    color: '#000000',
  },
  description: {
    fontSize: 30, // Example font size
    fontWeight: 'bold', // Example font weight
    marginBottom: 10, // Example bottom margin
    color: '#000000',
    paddingTop: 10,
    textAlign: 'center', // Center text horizontally
  },  
  dayContainer: {
    fontSize: 20, // Example font size
    fontWeight: 'bold', // Example font weight
    marginBottom: 10, // Example bottom margin
    color: '#333',
  },
  weatherConditionContainer: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 2,
    marginRight: 10,
    height: 220,
    width: 150,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Example background color
  },
  dayName: {
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center', // Align text to the center
    paddingBottom: 5, // Add padding to separate the day name from the time
  },
  time: {
    fontSize: 20,
    color: '#000000', // Add color if needed
    paddingBottom: 2,
    paddingTop: 5,
    fontWeight: 'bold',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 20, // Adjust font size for temperature
    paddingBottom: 2,
    fontWeight: 'bold',
  },
  weatherDescription: {
    fontSize: 20, // Adjust font size for weather description
    fontWeight: 'bold',
  },  
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // Cover the entire container
    justifyContent: 'center',
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 245, 245, 0.6)',
  },
  buttonText: {
    color: '#000', // Set custom font color for the button text
    fontWeight: 'bold',
    fontSize: 18,
  },
  forecastTopic: {
    fontSize: 25,
    marginBottom: 10,
    marginLeft: 20,
    color: '#000000', // Adjust color if needed
    top: 490,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45, // Adjust top position to align suggestions below the search container
    width: '100%', // Take the full width of the parent
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adjust background color
    borderRadius: 8,
    maxHeight: 150, // Set a max height to limit suggestions container height
    zIndex: 1, // Ensure suggestions are displayed above other content
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default WeatherApp;