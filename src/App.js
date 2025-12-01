import { extend } from "leaflet";
import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  state = {
      location: "",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };

    HandleLocation=(e)=>{
       
              this.setState(() => {
                return { location: e.target.value, weather: {} };
              })
    }
 

   fetchWeather=async ()=> {
    try {
      if(this.state.location.length<2){
        this.setState({weather:{}})
      }
      // 1) Getting location (geocoding)
      this.setState({ isLoading: true });
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      

      if (!geoData.results) throw new Error("Location not found");
      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  componentDidMount(){
    // this.fetchWeather()
    let prevLocation=localStorage.getItem("location")
    
    this.setState({location:prevLocation})
  }

  componentDidUpdate(prevProp,prevState){
      if(this.state.location!==prevState.location){
        this.fetchWeather()
        localStorage.setItem("location",this.state.location)
      }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
       <Input location={this.state.location} onChangeLocation={this.HandleLocation}/>
        </div>
       

        {this.state.isLoading && <p className="Loader">Loading data...</p>}

        {this.state.weather.weathercode  &&(
          <Weather
            weather={this.state.weather}
            location={this.state.location}
          />
        )}
      </div>
    );
  }
}

class Input extends React.Component{
  render(){
    return    <input
            type="text"
            value={this.props.location}
            placeholder="Search from location..."
            onChange={this.props.onChangeLocation }
          ></input>
  }
}

class Weather extends React.Component {
  componentWillUnmount(){
    console.log("component is unmount")
  }
  render() {
   
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <div>
        <h1>Weather {this.props.location}</h1>
        <ul className="weather">
          {dates.map((date, i) => {
            return (
              <Day
                date={date}
                min={min.at(i)}
                max={max.at(i)}
                code={codes.at(i)}
                key={date}
                isToday={i === 0}
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { date, min, max, code, isToday } = this.props;
    return (
      <li className="day">
        <p>{getWeatherIcon(code)}</p>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)} &deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}

export default App;
