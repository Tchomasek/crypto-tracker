
# Crypto Tracker

This is a simple crypto tracker application that displays a list of cryptocurrencies with their rank, symbol, name, current price, and 24h % change. It uses the CoinGecko API to fetch the initial cryptocurrency data and the Finnhub WebSocket API to get real-time price updates.

## Features

* Displays a list of cryptocurrencies with their rank, symbol, name, current price, and 24h % change.
* Real-time price updates using WebSockets.
* Sort the table by rank, symbol, name, value, and 24h % change. It is possible to sort the columns by clicking on the table header or with the select above the table.
* Filter the list of coins by name or symbol.
* Subscribe to real-time price updates for a specific cryptocurrency.
* Subscriptions are saved in the session storage.
* Error state when connection to the websocket fails is displayed to the user. (Keep reloading the page to demonstrate the error state)


## Technologies Used

* React
* TypeScript
* react-use-websocket
* CoinGecko API
* Finnhub API

## Getting Started

### Prerequisites

* Node.js
* npm

### Installing

1. Clone the repository
```
git clone https://github.com/your-username/crypto-tracker.git
```
2. Install the dependencies
```
npm install
```
3. For possibility of testing the app localy, there are commented out API keys in `constants.ts`. 

### Running the application

```
npm start
```

### Deployment
This App is also deployed on Vercel:
[Deployed app](https://crypto-tracker-amber-eight.vercel.app/)

