# project-software-architectures
- order sharing system
- M2 SE1 promo 2024

## Contributors
```
Van Alenn PHAM
Senhua LIU
Jonathan EL BAZ
Camille FOUR
Huiting FENG
```
## Architectural Diagram

## User Interface (UI) Layer:

Customer UI: This interface allows customers to select products, place orders, and make payments. It communicates directly with application layer services such as order management and payment service.

Agent UI: Used by catalog managers to manage products and orders. It also interacts with the application layer, specifically with the product catalog service to manage listings.

## Application Layer:

Order Management Service: Central to the application, this service manages the creation, modification, and tracking of orders. It interacts with the Customer UI for order placement, the product database to check availability, and the order database to update or track the status of orders.

Product Catalog Service: Manages the lists of products available to customers and agents. It retrieves and updates information in the product database and interacts with both the customer and agent UIs to display products and manage the catalog.

Payment Service: Processes payments by integrating an external payment gateway like Stripe. It handles transactions initiated from the Customer UI and interacts with the order database to update payment statuses.

Notification Service: Sends confirmation emails and notifications to customers. It uses the email service to send messages and interacts with the user database to retrieve customer contact details.

## Database Layer:

User Database: Stores user accounts and profiles, including credentials and contact details used by the notification service to send emails.

Order Database: Maintains records of all orders, used by the order management service to track and update orders.

Product Database: Keeps details of products, accessed by the product catalog service to manage product information.

## External Integrations:

Payment Gateway (like Stripe): Used by the payment service to handle online transactions securely and return the status to the payment service.

Email Service: Used by the notification service to send emails to customers and agents, acting as an email dispatcher.

## Other Considerations:

Security: Measures are implemented at all levels to protect data, ensure secure transactions, and manage user authentication and authorization.

Scalability: Ensures that services can handle increased loads, which may involve load balancing, horizontal scaling, and efficient database management.
