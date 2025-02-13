# 🏹 actioman

Share functions with other js clients. Call backend functions with type-safety.
Comparte funciones con otros clientes JS. Llama a funciones del backend con type-safety.

Actioman is a tool to expose Javascript functions as web services in a simple and fast way. With actioman, you can build robust and type-safe APIs using your existing Javascript functions, facilitating communication between your backend and Javascript clients (whether they are browsers, mobile applications, or even other backend services).

## Features

- **Simple service deployment:** With actioman, setting up a service is as easy as running a command, without complex configurations or laborious deployments.
- **Flexible deployment:** It can be deployed over HTTP, HTTPS, and HTTP2 (with or without SSL), adapting to your security and performance needs.
- **Clear contracts with Zod:** Define clear contracts between client and server using Zod to describe the shape and data type of input and output of your services. This ensures type-safety and facilitates data validation.
- **Rapid service exposure:** Convert your Javascript functions into endpoints accessible over the network instantly. Ideal for rapid prototyping or for exposing backend functionalities in an agile manner.
- **Easy installation of exposed services:** Clients can install and use exposed services with a single command line, simplifying the integration and consumption of your APIs.
- **Easy to protect:** Implement security mechanisms to protect your services from unauthorized access, ensuring the integrity and confidentiality of your data.

## Setup

To start using actioman, follow these simple steps:

1. **Create an `actions.js` file:**

   Create a file named `actions.js` in your project. In this file, define the Javascript functions you want to expose as services.

   ```js
   // ./actions.js
   export const hello = () => "hello world";
   ```

2. **Start the actioman server:**

   Open your terminal in the root of your project and execute the following command to start the actioman server, serving the functions defined in `actions.js`:

   ```bash
   npx actioman actions.js
   ```

   When executing this command, you will see a message similar to this in the console:

   ```
   Route GET /__actions
   Route POST /__actions/hello
   Listening on http://localhost:30320/
   ```

   This message indicates:

   - `Route GET /__actions`: A GET route has been created at `/__actions`. This route exposes the contracts of all services defined in `actions.js` in JSON format. You can use it to inspect the structure of your services.
   - `Route POST /__actions/hello`: A POST route has been created at `/__actions/hello`. This route corresponds to the `hello` function you defined in `actions.js`. To invoke this service, you must make a POST request to this URL.
   - `Listening on http://localhost:30320/`: The actioman server is running and listening for requests at the URL `http://localhost:30320/`. The port `30320` may vary.

## Adding Actioman services to your project

Once your actioman service is running, you can consume it from another Javascript project. Follow these steps to import and use your services:

1. **Install the `actioman` dependency:**

   In your client project, install the `actioman` library using npm:

   ```bash
   npm add actioman
   ```

2. **Add the Actioman service:**

   Use the `actioman add` command to register an Actioman service in your client project. Replace `myservice` with the name you want to give your service locally, and `http://localhost:30320/` with the URL where your actioman server is running (the one shown in the console when starting the server).

   ```bash
   npx actioman add myservice http://localhost:30320/
   ```

   This command configures `actioman` so that it can access the services exposed at the provided URL under the name `myservice`.

3. **Use the services in your code:**

   Now you can import and use your actioman services in your Javascript code. The following example shows how to call the `hello` function of the `myservice` service:

   ```js
   // my-app.js
   import { actions } from "actioman";

   const myservice = actions.myservice();

   const message = await myservice.hello();
   console.log(message); // => "hello world"
   ```

   In this code:

   - `import { actions } from "actioman"`: Imports the `actions` object from the `actioman` library.
   - `const myservice = actions.myservice()`: Creates an instance of the `myservice` service that you configured previously. `actions.myservice()` generates a type-safe client to interact with your remote service.
   - `await myservice.hello()`: Calls the `hello` function of the `myservice` service. This call translates into an HTTP request to the actioman server. Since service calls are asynchronous, we use `await` to wait for the response.

## License

This project is open source and is licensed under the MIT License. You can find the full text of the license in the [LICENSE](./LICENSE) document.
