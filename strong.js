// src/script/strong.js

const StorageManager = {
  getUser: () => {
    return JSON.parse(localStorage.getItem("travel_user")) || null;
  },
  saveUser: (userData) => {
    localStorage.setItem("travel_user", JSON.stringify(userData));
  },
};
