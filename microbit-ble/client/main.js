"use strict";
window.addEventListener("load", () => {
  const FORECAST_API = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast`;
  const QUERY_STRING = "units=si&exclude=minutely,hourly,daily,alerts,flags";

  const BIT0 = 1 << 4;
  const BIT1 = 1 << 3;
  const BIT2 = 1 << 2;
  const BIT3 = 1 << 1;
  const BIT4 = 1;

  const DISPLAY_MODES = ["scroll", "icon", "temperature"];
  const ICON_MATRIX_CMDS = {
    "clear-day": [
      BIT2,
      BIT1 | BIT2 | BIT3,
      BIT0 | BIT1 | BIT2 | BIT3 | BIT4,
      BIT1 | BIT2 | BIT3,
      BIT2
    ],
    "clear-night": [
      BIT0 | BIT1 | BIT2,
      BIT1 | BIT2 | BIT3,
      BIT2 | BIT3,
      BIT1 | BIT2 | BIT3,
      BIT0 | BIT1 | BIT2
    ],
    rain: [BIT1 | BIT4, BIT0 | BIT3, BIT1, BIT0 | BIT3, BIT2],
    snow: [
      BIT0 | BIT2 | BIT4,
      BIT1 | BIT2 | BIT3,
      BIT0 | BIT1 | BIT2 | BIT3 | BIT4,
      BIT1 | BIT2 | BIT3,
      BIT0 | BIT2 | BIT4
    ],
    sleet: [],
    wind: [
      BIT1 | BIT2 | BIT3 | BIT4,
      BIT0 | BIT1,
      BIT2 | BIT3 | BIT4,
      BIT0 | BIT1 | BIT2,
      0
    ],
    fog: [],
    cloudy: [
      0,
      BIT2 | BIT3,
      BIT1 | BIT2 | BIT3 | BIT4,
      BIT0 | BIT1 | BIT2 | BIT3 | BIT4,
      0
    ],
    "partly-cloudy-day": [
      BIT1 | BIT4,
      BIT3,
      BIT1,
      BIT0 | BIT1 | BIT2 | BIT4,
      BIT0 | BIT1 | BIT2 | BIT3
    ],
    "partly-cloudy-night": [
      BIT2 | BIT3,
      BIT3 | BIT4,
      BIT2 | BIT3,
      BIT0 | BIT1,
      BIT0 | BIT1 | BIT2
    ]
  };
  const TENS_MATRIX_CMDS = [
    [0, 0, 0, 0, 0],
    [BIT0, BIT0, BIT0, BIT0, BIT0],
    [BIT0 | BIT1, BIT1, BIT0 | BIT1, BIT0, BIT0 | BIT1],
    [BIT0 | BIT1, BIT1, BIT0 | BIT1, BIT1, BIT0 | BIT1],
    [BIT1, BIT0 | BIT1, BIT0 | BIT1, BIT1, BIT1],
    [BIT0 | BIT1, BIT0, BIT0 | BIT1, BIT1, BIT0 | BIT1],
    [BIT1, BIT0, BIT0, BIT0 | BIT1, BIT0 | BIT1],
    [BIT0, BIT1, BIT1, BIT1, BIT1],
    [BIT1, BIT0 | BIT2, BIT1, BIT0 | BIT2, BIT1],
    [BIT0 | BIT1, BIT0 | BIT1, BIT0 | BIT1, BIT1, BIT1]
  ];
  const ONES_MATRIX_CMDS = [
    [BIT3 | BIT4, BIT3 | BIT4, BIT3 | BIT4, BIT3 | BIT4, BIT3 | BIT4],
    [BIT4, BIT4, BIT4, BIT4, BIT4],
    [BIT3 | BIT4, BIT4, BIT3 | BIT4, BIT3, BIT3 | BIT4],
    [BIT3 | BIT4, BIT4, BIT3 | BIT4, BIT4, BIT3 | BIT4],
    [BIT4, BIT3 | BIT4, BIT3 | BIT4, BIT4, BIT4],
    [BIT3 | BIT4, BIT3, BIT3 | BIT4, BIT4, BIT3 | BIT4],
    [BIT4, BIT3, BIT3, BIT3 | BIT4, BIT3 | BIT4],
    [BIT3 | BIT4, BIT4, BIT4, BIT4, BIT4],
    [BIT3, BIT2 | BIT4, BIT3, BIT2 | BIT4, BIT3],
    [BIT3 | BIT4, BIT3 | BIT4, BIT3 | BIT4, BIT4, BIT4]
  ];

  const LED_SVC_UUID = "e95dd91d-251d-470a-a062-fa1922dfa9a8";
  const LED_MATRIX_CHAR_UUID = "e95d7b77-251d-470a-a062-fa1922dfa9a8";
  const LED_TEXT_CHAR_UUID = "e95d93ee-251d-470a-a062-fa1922dfa9a8";
  const BTN_SVC_UUID = "e95d9882-251d-470a-a062-fa1922dfa9a8";
  const BTN_A_CHAR_UUID = "e95dda90-251d-470a-a062-fa1922dfa9a8";
  const BTN_B_CHAR_UUID = "e95dda91-251d-470a-a062-fa1922dfa9a8";

  const latitudeText = document.getElementById("latitude-text");
  const longitudeText = document.getElementById("longitude-text");
  const temperatureText = document.getElementById("temperature-text");
  const iconText = document.getElementById("icon-text");
  const humidityText = document.getElementById("humidity-text");
  const dewPointText = document.getElementById("dew-point-text");
  const pressureText = document.getElementById("pressure-text");
  const uvIndexText = document.getElementById("uv-index-text");
  const windSpeedText = document.getElementById("wind-speed-text");
  const visibilityText = document.getElementById("visibility-text");
  const apiKeyInput = document.getElementById("api-key-input");
  const connectBtn = document.getElementById("connect-btn");

  let curState = newState();
  function newState() {
    return {
      gattServer: null,
      ledSvc: null,
      ledMatrixChar: null,
      ledTextChar: null,
      btnSvc: null,
      btnAChar: null,
      btnBChar: null,
      connecting: false,
      connected: false,
      watchId: null,
      displayMode: 0,
      changingMode: false
    };
  }
  function setState(state) {
    curState = {
      ...curState,
      ...state
    };

    // Render the UI
    connectBtn.textContent = curState.connected ? "Disconnect" : "Connect";
    connectBtn.disabled = curState.connecting;

    if (curState.position) {
      const { latitude, longitude } = curState.position;
      latitudeText.textContent = `Latitude: ${latitude}`;
      longitudeText.textContent = `Longitude: ${longitude}`;
    }

    if (curState.weather) {
      const {
        temperature,
        humidity,
        dewPoint,
        pressure,
        uvIndex,
        windSpeed,
        visibility,
        summary,
        icon
      } = curState.weather;
      temperatureText.textContent = `Temperature: ${temperature}°C`;
      iconText.textContent = `Icon: ${icon}`;
      humidityText.textContent = `Humidity: ${humidity * 100}%`;
      dewPointText.textContent = `Dew point: ${dewPoint}°C`;
      pressureText.textContent = `Pressure ${pressure} hPa`;
      uvIndexText.textContent = `UV index: ${uvIndex}`;
      windSpeedText.textContent = `Wind speed: ${windSpeed} m/s`;
      visibilityText.textContent = `Visibility: ${visibility} km`;

      // Render micro:bit display
      let matrix;
      switch (curState.displayMode) {
        // Temperature
        case 2:
          const nums = Math.round(temperature)
            .toString()
            .split("")
            .map(numStr => Number(numStr));
          matrix = TENS_MATRIX_CMDS[nums[0]].map(
            (cur, idx) => cur | ONES_MATRIX_CMDS[nums[1]][idx]
          );
          sendMatrix(matrix);
          break;
        // Weather icon
        case 1:
          matrix = ICON_MATRIX_CMDS[icon];
          sendMatrix(matrix);
          break;
        // Scroll
        case 0:
        default:
          const text = icon.split("").map((c, i) => {
            if (c === "-") return 32;
            return icon.charCodeAt(i);
          });
          sendText(text);
          break;
      }
    }
  }

  function sendText(text) {
    if (!curState.ledTextChar) return;

    const cmd = new Uint8Array(text);
    curState.ledTextChar
      .writeValue(cmd)
      .then(() => console.log(`Sent text: ${text}`));
  }

  function sendMatrix(matrix) {
    if (!curState.ledMatrixChar) return;

    const cmd = new Uint8Array(matrix);
    curState.ledMatrixChar
      .writeValue(cmd)
      .then(() => console.log(`Sent matrix: ${matrix}`));
  }

  apiKeyInput.addEventListener("input", event => {
    setState({
      apiKey: event.target.value
    });
  });

  connectBtn.addEventListener("click", () => {
    if (curState.connected) {
      console.log("Disconnecting");
      if (curState.gattServer && curState.gattServer.connected) {
        curState.gattServer.disconnect();
      }
      if (curState.watchId) {
        navigator.geolocation.clearWatch(curState.watchId);
      }
      setState(newState());
      return;
    }

    console.log("Connecting");
    setState({
      connecting: true
    });
    if (!curState.ledMatrixChar) {
      navigator.bluetooth
        .requestDevice({
          filters: [
            {
              namePrefix: "BBC micro:bit"
            }
          ],
          optionalServices: [LED_SVC_UUID, BTN_SVC_UUID]
        })
        .then(device => {
          console.log("Requested a device");
          return device.gatt.connect();
        })
        .then(server => {
          console.log("Connected to the GATT server");
          setState({
            gattServer: server
          });
          return curState.gattServer.getPrimaryService(LED_SVC_UUID);
        })
        .then(service => {
          console.log("Found the LED service");
          setState({
            ledSvc: service
          });
          return curState.ledSvc.getCharacteristic(LED_MATRIX_CHAR_UUID);
        })
        .then(characteristic => {
          console.log("Found the LED matrix characteristic");
          setState({
            ledMatrixChar: characteristic
          });
          return curState.ledSvc.getCharacteristic(LED_TEXT_CHAR_UUID);
        })
        .then(characteristic => {
          console.log("Found the LED text characteristic");
          setState({
            ledTextChar: characteristic
          });
          return curState.gattServer.getPrimaryService(BTN_SVC_UUID);
        })
        .then(service => {
          console.log("Found the button service");
          setState({
            btnSvc: service
          });
          return curState.btnSvc.getCharacteristic(BTN_A_CHAR_UUID);
        })
        .then(characteristic => {
          console.log("Found the button A characteristic");
          setState({
            btnAChar: characteristic
          });
          curState.btnAChar.startNotifications().then(_ => {
            console.log("Started button A notifications");
            curState.btnAChar.addEventListener(
              "characteristicvaluechanged",
              event => {
                if (curState.changingMode) {
                  setState({
                    changingMode: false
                  });
                  return;
                }
                console.log("Button A changed");
                setState({
                  displayMode:
                    (curState.displayMode - 1 + DISPLAY_MODES.length) %
                    DISPLAY_MODES.length,
                  changingMode: true
                });
              }
            );
          });
          return curState.btnSvc.getCharacteristic(BTN_B_CHAR_UUID);
        })
        .then(characteristic => {
          console.log("Found the button B characteristic");
          setState({
            btnBChar: characteristic
          });
          curState.btnBChar.startNotifications().then(_ => {
            console.log("Started button B notifications");
            curState.btnBChar.addEventListener(
              "characteristicvaluechanged",
              event => {
                if (curState.changingMode) {
                  setState({
                    changingMode: false
                  });
                  return;
                }
                console.log("Button B changed");
                setState({
                  displayMode:
                    (curState.displayMode + 1) % DISPLAY_MODES.length,
                  changingMode: true
                });
              }
            );
          });
        })
        .then(_ => {
          setState({ connecting: false, connected: true });
          const watchId = navigator.geolocation.watchPosition(({ coords }) => {
            const { latitude, longitude } = coords;
            console.log(`Received position: ${latitude}, ${longitude}`);
            setState({
              watchId,
              position: { latitude, longitude }
            });

            const time = new Date().valueOf();
            if (
              curState.lastUpdatedPos &&
              distance(
                deg2Rad(curState.lastUpdatedPos.latitude),
                deg2Rad(curState.lastUpdatedPos.longitude),
                deg2Rad(curState.position.latitude),
                deg2Rad(curState.position.longitude)
              ) < 1e3 && // Within 1 km distance
              curState.lastUpdatedTime &&
              time - curState.lastUpdatedTime < 3e5 // 300 second delay
            ) {
              return;
            }

            console.log("Querying API");

            setState({
              lastUpdatedTime: time,
              lastUpdatedPos: curState.position
            });
            queryAPI(curState.position.latitude, curState.position.longitude)
              .then(data => {
                setState({
                  weather: data
                });
              })
              .catch(error => console.error);
          });
          console.log("Registered geolocation");
        })
        .catch(error => {
          console.error(error);
          setState(newState());
        });
    }
  });

  async function queryAPI(lat, lon) {
    const { apiKey } = curState;
    if (!apiKey) return;

    const uri = `${FORECAST_API}/${apiKey}/${lat},${lon}?${QUERY_STRING}`;
    const response = await fetch(uri);
    const json = await response.json();
    return json.currently;
  }

  function deg2Rad(degree) {
    return (degree / 180) * Math.PI;
  }

  function distance(lat0, lon0, lat1, lon1) {
    const a =
      Math.sin((lat0 - lat1) / 2) ** 2 +
      Math.cos(lat0) * Math.cos(lat1) * Math.sin((lon0 - lon1) / 2) ** 2;
    return 6371e3 * 2 * Math.atan2(a ** 0.5, (1 - a) ** 0.5);
  }
});
