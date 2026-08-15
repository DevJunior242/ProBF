import React from "react";

export default function TestPage() {
  const request = indexedDB.open("todos-db", 1);
  console.log("request", request);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    console.log("db", db);
    // create the store on first open, keyed by the 'id' field
    const store = db.createObjectStore("todos", { keyPath: "id" });
    console.log("store", store);
    // add a secondary index so we can query by category later
    store.createIndex("category", "category", { unique: false });
  };

  let db;
  request.onsuccess = (event) => {
    db = event.target.result; // the database is ready to use here
  };

  request.onerror = (event) => {
    console.error("Could not open the database", event.target.error);
  };

  const init = indexedDB.open("init", 1);
  console.log("init", init);
  return null;
}
