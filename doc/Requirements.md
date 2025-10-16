# Requirements Document - GeoControl

Date:

Version: V1 - description of Geocontrol as described in the swagger


| Version number |     Change     |
| :--------------: | :---------------: |
|      1.0      | Initial version |

# Contents

- [Requirements Document - GeoControl](#requirements-document---geocontrol)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Business model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
  - [Use case 1, UC1 - Sign In](#use-case-1-uc1---sign-in)
    - [Scenario 1.1: Sign In with valid credentials](#scenario-11-sign-in-with-valid-credentials)
    - [Scenario 1.2: Sign In with invalid credentials](#scenario-12-sign-in-with-invalid-credentials)
  - [Use case 2, UC2 - Sign Out](#use-case-2-uc2---sign-out)
    - [Scenario 2.1: Sign Out with valid token](#scenario-21-sign-out-with-valid-token)
    - [Scenario 2.2: Sign Out with invalid token](#scenario-22-sign-out-with-invalid-token)
  - [Use case 3, UC3 - Sign Up](#use-case-3-uc3---sign-up)
    - [Scenario 3.1: Sign Up with valid data](#scenario-31-sign-up-with-valid-data)
    - [Scenario 3.2: Sign Up with username already in use](#scenario-32-sign-up-with-username-already-in-use)
  - [Use case 4, UC4 - Users Management (Admin)](#use-case-4-uc4--users-management-admin)
    - [Scenario 4.1: Adding a new user](#scenario-41-adding-a-new-user)
    - [Scenario 4.2: Editing an existing user role](#scenario-42-editing-an-existing-user-role)
    - [Scenario 4.3: Deleting an existing user](#scenario-43-deleting-an-existing-user)
  - [Use case 5, UC5 - Network Management](#use-case-5-uc5--network-management)
    - [Scenario 5.1: Creating a new network](#scenario-51-creating-a-new-network)
    - [Scenario 5.2: Retrieve a specific network](#scenario-52-retrieve-a-specific-network)
    - [Scenario 5.3: Retrieve all networks](#scenario-53-retrieve-all-networks)
    - [Scenario 5.4: Update an existing network](#scenario-54-update-an-existing-network)
    - [Scenario 5.5: Delete an existing network](#scenario-55-delete-an-existing-network)
  - [Use case 6, UC6 - Gateway Management](#use-case-6-uc6--gateway-management)
    - [Scenario 6.1: Creating a new gateway associated to a network](#scenario-61-creating-a-new-gateway-associated-to-a-network)
    - [Scenario 6.2: Editing an existing gateway](#scenario-62-editing-an-existing-gateway)
    - [Scenario 6.3: Deleting an existing gateway](#scenario-63-deleting-an-existing-gateway)
    - [Scenario 6.4: Retrieve a specific gateway](#scenario-64-retrieve-a-specific-gateway)
    - [Scenario 6.5: Retrieve all gateways](#scenario-65-retrieve-all-gateways)
  - [Use case 7, UC7 - Sensor Management](#use-case-7-uc7--sensor-management)
    - [Scenario 7.1: Adding a sensor to a gateway](#scenario-71-adding-a-sensor-to-a-gateway)
  - [Use case 8, UC8 - Measurement Submission](#use-case-8-uc8--measurement-submission)
    - [Scenario 8.1: Submitting a measurement](#scenario-81-submitting-a-measurement)
  - [Use case 9, UC9 - Measurement Data Consultation](#use-case-9-uc9--measurement-data-consultation)
    - [Scenario 9.1: Statistical Analysis for a Single Sensor](#scenario-91-statistical-analysis-for-a-single-sensor)
    - [Scenario 9.2: Statistical Analysis for Multiple Sensors in a Network](#scenario-92-statistical-analysis-for-multiple-sensors-in-a-network)
  - [Use case 10, UC10 - Outlier Detection](#use-case-10-uc10--outlier-detection)
    - [Scenario 10.1: Retrieving outliers for a single sensor](#scenario-101-retrieving-outliers-for-a-single-sensor)
    - [Scenario 10.2: Retrieving outliers for a given network](#scenario-102-retrieving-outliers-for-a-given-network)
  - [Use Case 11, UC11 - Topology Synchronization](#use-case-11-uc11--topology-synchronization)
    - [Scenario 11.1: Creating a New Network](#scenario-111-creating-a-new-network)
    - [Scenario 11.2: Updating an Existing Network](#scenario-112-updating-an-existing-network)
    - [Scenario 11.3: Deleting a Network](#scenario-113-deleting-a-network)
    - [Scenario 11.4: Adding a Gateway to a Network](#scenario-114-adding-a-gateway-to-a-network)
    - [Scenario 11.5: Updating a Gateway](#scenario-115-updating-a-gateway)
    - [Scenario 11.6: Removing a Gateway from a Network](#scenario-116-removing-a-gateway-from-a-network)
    - [Scenario 11.7: Adding a Sensor to a Gateway](#scenario-117-adding-a-sensor-to-a-gateway)
    - [Scenario 11.8: Updating a Sensor](#scenario-118-updating-a-sensor)
    - [Scenario 11.9: Removing a Sensor from a Gateway](#scenario-119-removing-a-sensor-from-a-gateway)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

GeoControl is a software system designed for monitoring physical and environmental variables across various contexts: from hydrogeological analysis in mountainous areas, to the surveillance of historical buildings, and even the monitoring of indoor parameters (such as temperature or lighting) in residential or work environments.

Originally commissioned by the Union of Mountain Communities of the Piedmont Region to manage the hydrogeological conditions of its territories, GeoControl has evolved into a modular platform that is now also used by other public and private entities requiring continuous monitoring of physical parameters.

The system meets high reliability standards and is required to ensure that no more than six measurements per sensor, per year, are lost. From an organizational perspective, GeoControl implements a token-based authentication system and supports role-based access control to regulate user permissions.

# Business Model


|     Funding Type     |                                            Description                                            |
| :--------------------: | :-------------------------------------------------------------------------------------------------: |
| Public Institutional |   Initial funding by public authority (Union of Mountain Communities) for internal, free usage   |
| Commercial Licensing | Other organizations pay for the use of the system based on modular needs, potentially pay-per-use |

# Stakeholders


|             Stakeholder name             |                                                                      Description                                                                      |
| :----------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: |
| Union of Mountain Communities (Piedmont) |                              Initial client who commissioned the system for hydrogeological monitoring in mountain areas                              |
|         Public/Private Entities         |        Additional organizations that use the system to monitor physical parameters in historical buildings, residential, or work environments        |
|                  Admin                  |                                     Manage user accounts, roles, device configurations, and monitor system status                                     |
|                  Viewer                  |                                             Access sensor data, visualize measurements, generate reports                                             |
|                 Operator                 |                                                         Access and modify data and structures                                                         |
|             External systems             | Third-party platforms or IoT gateways that interact with GeoControl via API to send measurement data, manage device status, or perform remote control |

# Context Diagram and interfaces

## Context Diagram
![context-diagram](http://www.plantuml.com/plantuml/svg/POvB2i9038RtEKKkC3SGgRZeqeNWFdH27PoPb4nABTAxYxRMr-v_X2z_LOpK-XInaMnyDUS3jKe9eLn2xkWXgJ7HeusHaGOkaXYU4Uvy2ddHXuwLJ7Infy03lqnDnWEDaCKprYnxoQOI0KnQjZFh3N26eNFRpmjSkV_D_E8tdxwfxmOtpgrB9e2Ai-zJl0C0)

## Interfaces


|  Actor  | Logical Interface |   Physical Interface   |
| :--------: | :-----------------: | :-----------------------: |
|  Admin  |        GUI        | Screen, keyboard, mouse |
| Operator |        GUI        | Screen, keyboard, mouse |
|  Viewer  |        GUI        | Screen, keyboard, mouse |
| Gateway |     REST API     |   Internet connection   |

# Stories and personas

## Personas

### Marco – The Admin

- **Age:** 43
- **Role:** System Administrator at the Union of Mountain Communities
- **Goals:**
  - Configure and supervise the environmental monitoring network
  - Manage user accounts and system integrity
- **Tech Skills:** High – expert in networks and IT systems
- **Pain Points:** Needs to ensure secure access and system reliability across multiple users and devices

### Giulia – The Operator

- **Age:** 35
- **Role:** Environmental Technician for a local municipality
- **Goals:**
  - Add or replace sensors and gateways in the system
  - Reflect changes in the physical infrastructure in the software
- **Tech Skills:** Medium – proficient with software tools but not a developer
- **Pain Points:** Needs an intuitive interface to manage devices without introducing errors or duplicates

### Luca – The Viewer

- **Age:** 29
- **Role:** Data Analyst for a heritage conservation project
- **Goals:**
  - Access and analyze measurement data from monitored sites
  - Identify environmental risks or unusual patterns
- **Tech Skills:** High – familiar with data visualization and analysis tools
- **Pain Points:** Needs fast access to clean, reliable data without configuration overhead

## Stories

## Stories

### Section 1 – Authentication and User Management

**US1.1 – User login**  
*As a user (Admin, Operator, Viewer)*  
I want to log in using valid credentials  
So that I can receive a token to access the system's authorized features

**US1.2 – User logout**  
*As an authenticated user*  
I want to log out securely  
So that my session token is invalidated, preventing unauthorized access

**US1.3 – User management (Admin)**  
*As Marco (Admin)*  
I want to create, modify, and delete user accounts  
So that I can control who accesses the system and with what permissions

---

### Section 2 – Topology Management

**US2.1 – Create a new network (Operator/Admin)**  
*As Giulia (Operator)*  
I want to create a new network identified by a unique code  
So that I can correctly represent a new group of devices in the field

**US2.2 – Add a gateway to a network**  
*As Giulia (Operator)*  
I want to add a new gateway by entering its MAC address  
So that I can associate real physical devices to the monitored network

**US2.3 – Connect a sensor to a gateway**  
*As Giulia (Operator)*  
I want to link a sensor to a gateway  
So that I can update the device map accurately

**US2.4 – Topological synchronization (Admin/Operator)**  
*As an authorized user*  
I want to update or remove networks, gateways, and sensors  
So that the system reflects the actual field infrastructure

---

### Section 3 – Data Acquisition

**US3.1 – Submit a measurement from a sensor**  
*As an automated system (gateway)*  
I want to send a measured value with a local timestamp  
So that the system can convert it to UTC and store it reliably

**US3.2 – Reliable data logging**  
*As a system administrator*  
I want the system to lose no more than 6 measurements per year per sensor  
So that I can ensure the reliability of the collected data

---

### Section 4 – Data Consultation and Analysis

**US4.1 – View sensor data**  
*As Luca (Viewer)*  
I want to access the data collected by a sensor  
So that I can analyze the trends of environmental parameters

**US4.2 – Statistical analysis for a sensor**  
*As Luca (Viewer)*  
I want to compute the mean, variance, and thresholds for a sensor over a time range  
So that I can detect anomalies and interpret data correctly

**US4.3 – Outlier detection**  
*As Luca (Viewer)*  
I want to view values considered anomalous based on statistical thresholds  
So that I can identify potential risks or hardware failures

**US4.4 – Network-wide analysis**  
*As Luca (Viewer)*  
I want to perform aggregate analysis across multiple sensors in a network  
So that I can get an overall view of the monitored site

---

### Section 5 – Usability and Security

**US5.1 – Intuitive interface for operators**  
*As Giulia (Operator)*  
I want a simple and clear user interface with helpful feedback  
So that I can manage networks, gateways, and sensors without making mistakes

**US5.2 – Secure role-based access**  
*As Marco (Admin)*  
I want each user to only access the functionalities allowed by their role  
So that I can guarantee the integrity and security of the system

# Functional and non functional requirements

## Functional Requirements


|  ID   | Description |
| :---: | :---------: |
| **FR1** | **Authentication and User Management**                 |
|  FR1.1  | Login                                                  |
|  FR1.2  | Create a token                                         |
|  FR1.3  | Validate token for other requests                      |
|  FR1.4  | Support Admin, Operator, Viewer to have different roles|
|  FR1.5  | Logout                                                 |
|  FR1.6  | Create a new User                                      |
|  FR1.7  | Retrieve a specific user                               |
|  FR1.8  | Retrieve all users                                     |
|  FR1.9  | Delete a user                                          |
| **FR2** | **Topology Management and Synchronization**            |
|  FR2.1  | Create, update and delete a network                    |
|  FR2.2  | Retrieve all networks                                  |
|  FR2.3  | Retrieve a specific network                            |
|  FR2.4  | Creation, updating and deleting of gateways            |
|  FR2.5  | Retrieve all gateways                                  |
|  FR2.6  | Retrieve a specific gateway                            |
|  FR2.7  | Creation, updating and deleting of sensors             |
|  FR2.8  | Retrieve all sensors                                   |
|  FR2.9  | Retrieve a specific sensor                             |
|  FR2.10 | Unique code identification for networks                |
|  FR2.11  | MAC address as idetification for gateways and sensors  |
| **FR3** | **Measurement Collection and Storage**                 |
|  FR3.1  | Record measurements from gateways                      |
|  FR3.2  | Link measurements to the corresponding sensor          |
|  FR3.3  | Convert timestamp in ISO 8601 UTC format and stores it |
| **FR4** |                   **Data Retrieval**                   |
|  FR4.1  |       Provide stored measurement data to clients       |
|  FR4.2  |           Ensure timestamps are always in UTC           |
|  FR4.3  | Convertion of timestamps to local timezone for clients |
|  FR4.4  | Convertion of timestamps to local timezone for clients |
|  FR4.5  |    Retrieve statistics for specific sensor, network    |
|  FR4.6  |    Retrieve measuremens for specific sensor, network    |
| **FR5** |     **Statistical Analysis and Anomaly Detection**     |
|  FR5.1  |  Calculate mean and variance of measurements over time  |
|  FR5.2  |              Calculate anomaly thresholds              |
|  FR5.3  |                    Defining outliers                    |
| **FR6** |               **Reliability Constraints**               |
|  FR6.1  |              limit loss mesurement to six              |

## Non Functional Requirements


|  ID  | Type (efficiency, reliability, ..) |                      Description                      | Refers to |
| :----: | :----------------------------------: | :------------------------------------------------------: | :---------: |
| NFR1 |         Ensure Reliability         | No more loss than what define by limit loss mesurement |    FR6    |
| NFR2 |           Accessibility           |                  Provide intuitive UI                  |    FR1    |
| NFR3 |    Optimize System Performance    |  Process many measurement records without degradation  |    FR3    |
| NFR4 |            Scalability            |    Addition of new networks, gateways, and sensors    |    FR2    |
| NFR5 |            Availability            |   Ensure 99.9% uptime excluding maintenance periods   | FR1, FR3 |
| NFR6 |           Data Integrity           |  Store and retrieve measurements without modification  | FR3, FR4 |
| NFR7 |     Facilitate Maintainability     |          System updates with minimal downtime          | FR2, FR3 |
| NFR8 |      Comply with Regulations      | Adhere to ISO 27001 and GDPR for security and privacy | FR1, FR4 |
| NFR9 |             Efficiency             |      Time response should be lower than 1 second      |  All FR  |

# Use case diagram and use cases

## Use case diagram

![Use case diagram](http://www.plantuml.com/plantuml/svg/bLLBZzf03BxFhx3smdA8rFPSeKKWxQMFLH6zkud9ZaXceh5JX5h-UvN9WvaD8TiJoUVFzXVyUc919tLPm9u9KcI2J6Fki5IYfI0FRv29OTlX1Hq4n8BJ-Qj0fXsbegrH2rXd6N25gJOvLEYm9277Ye_Q-5UeC3rYJY-OPGtduuV0Pcn6J1Ly2a67vZW2CHNhTd8k2F14R4jI7e9rLchJFN-loA5Orxt-r7GYfvIdG9ByNLqP_KCBzynEApoiQtab8ph5vZCVu8y2UFnYSssMtPEjPQakWSkUoS5ND9XJIKOwdnyaJjDl0YmAg9aS-m0RHoW428PE7bx6PE2AKdtGwTMufOAyIuk4gR-HdAmxZhD7QKpByi7sLTORhk2G8GIZ3-WCFAbsy0pbFQFG2SypylAM5SiBmK5U24RoEiEqlC4pbBSZmzRDg6DFYiK5sA0jm29fBJwjhFUxAFMu4-i8IaAkdHV4oq3k5WNXnH6JaR0xXwYnOsZXne55fszmMqkXVMjUb5h0ixDr1QarffroXb_dVepXS1sizWUIrJ0QCU97f8UI1jnOmtKXaA7WKatq5dnEakGETznjCESIzWQyFtxVBk-9tnVuFy9tDP_pYEevHmvAF4STgWwtcQhfXM5F7chZcm4BBUTmVQwcrapC6M-Ss3vUFdTo37CyaMF2FjuWTtBq4pcHuhPvj0TYyyt9NhGtxCq_VEjoD6Ng3jwD2n9Q9oz9I8elIc1HJsIokYp-0G00 "Use case diagram")


### Use Case 1, UC1 - Sign In


| Actors Involved |                        User (Admin, Operator, Viewer)                        |
| :----------------: | :----------------------------------------------------------------------------: |
|   Precondition   | The user must have a valid account with credentials (username and password). |
|  Post condition  |  The user receives a valid JWT token to access the system functionalities.  |
| Nominal Scenario |          The user enters valid credentials and obtains a JWT token.          |
|     Variants     |                           No significant variants.                           |
|    Exceptions    |   Invalid credentials (401 Unauthorized), user not found (404 Not Found).   |

#### Scenario 1.1: Sign In with valid credentials


|  Scenario 1.1  |                                                       |
| :--------------: | :------------------------------------------------------: |
|  Precondition  | The user has a valid account with correct credentials. |
| Post condition |          The user receives a valid JWT token.          |
|     Step#     |                      Description                      |
|       1       |          The user accesses the login screen.          |
|       2       |         The user enters username and password.         |
|       3       |          The system verifies the credentials.          |
|       4       |     The system generates and returns a JWT token.     |

#### Scenario 1.2: Sign In with invalid credentials


|  Scenario 1.2  |                                                                 |
| :--------------: | :---------------------------------------------------------------: |
|  Precondition  |      The user tries to log in with incorrect credentials.      |
| Post condition |          The system returns a 401 Unauthorized error.          |
|     Step#     |                           Description                           |
|       1       |               The user accesses the login screen.               |
|       2       |        The user enters incorrect username and password.        |
|       3       | The system verifies the credentials and finds they are invalid. |
|       4       |          The system returns a 401 Unauthorized error.          |

---

### Use Case 2, UC2 - Sign Out


| Actors Involved |             User (Admin, Operator, Viewer)             |
| :----------------: | :------------------------------------------------------: |
|   Precondition   | The user must be authenticated with a valid JWT token. |
|  Post condition  |          The user's JWT token is invalidated.          |
| Nominal Scenario |    The user logs out and the token is invalidated.    |
|     Variants     |                No significant variants.                |
|    Exceptions    |      Invalid or expired token (401 Unauthorized).      |

#### Scenario 2.1: Sign Out with valid token


|  Scenario 2.1  |                                                         |
| :--------------: | :--------------------------------------------------------: |
|  Precondition  |    The user is authenticated with a valid JWT token.    |
| Post condition | The JWT token is invalidated and the user is logged out. |
|     Step#     |                       Description                       |
|       1       |            The user clicks the logout button.            |
|       2       |          The system invalidates the JWT token.          |
|       3       |          The user is logged out of the system.          |

#### Scenario 2.2: Sign Out with invalid token


|  Scenario 2.2  |                                                             |
| :--------------: | :------------------------------------------------------------: |
|  Precondition  | The user tries to log out with an invalid or expired token. |
| Post condition |         The system returns a 401 Unauthorized error.         |
|     Step#     |                         Description                         |
|       1       |              The user clicks the logout button.              |
|       2       | The system checks the token and finds it invalid or expired. |
|       3       |         The system returns a 401 Unauthorized error.         |

---

### Use Case 3, UC3 - Sign Up


| Actors Involved |                                      Admin                                      |
| :----------------: | :-------------------------------------------------------------------------------: |
|   Precondition   |             The Admin must be authenticated with a valid JWT token.             |
|  Post condition  |                  A new user account is created in the system.                  |
| Nominal Scenario | The Admin creates a new user account by providing username, password, and role. |
|     Variants     |                            No significant variants.                            |
|    Exceptions    |     Username already in use (409 Conflict), invalid data (400 Bad Request).     |

#### Scenario 3.1: Sign Up with valid data


|  Scenario 3.1  |                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |         The Admin is authenticated with a valid JWT token.         |
| Post condition |            A new user account is successfully created.            |
|     Step#     |                            Description                            |
|       1       |            The Admin accesses the user creation screen.            |
|       2       | The Admin enters the username, password, and role of the new user. |
|       3       |     The system verifies the data and creates the new account.     |
|       4       |         The system returns a confirmation of the creation.         |

#### Scenario 3.2: Sign Up with username already in use


|  Scenario 3.2  |                                                                       |
| :--------------: | :---------------------------------------------------------------------: |
|  Precondition  |  The Admin tries to create a user account with an existing username.  |
| Post condition |               The system returns a 409 Conflict error.               |
|     Step#     |                              Description                              |
|       1       |             The Admin accesses the user creation screen.             |
|       2       |          The Admin enters a username that is already in use.          |
|       3       | The system verifies the data and detects the username already exists. |
|       4       |               The system returns a 409 Conflict error.               |

---

### Use case 4, UC4 - Users Management (Admin)


| Actors Involved | Admin |
| :----------------: | :-----------------------------------------------------------------------: |
|   Precondition   | Admin is authenticated and has sufficient privileges |
|  Post condition  | Users are created, modified, or deleted in the system |
| Nominal Scenario | The admin accesses the user management interface to add new users, update existing ones (e.g., roles, passwords), or remove users. The system validates the inputs and updates the user registry accordingly. |
|     Variants     | Bulk user creation, role reassignment, password reset |
|    Exceptions    | Username already exists, invalid email format, user not found, insufficient permissions |

#### Scenario 4.1: Adding a new user


|  Scenario 4.1  |                                                         |
| :--------------: | :-------------------------------------------------------: |
|  Precondition  |               The admin is authenticated               |
| Post condition |  The new user is created and visible in the user list  |
|     Step#     |                       Description                       |
|       1       |    Admin navigates to the "User Management" section    |
|       2       |                Clicks on "Add new user"                |
|       3       |      Fills in username, email, password, and role      |
|       4       |                      Clicks "Save"                      |
|       5       |       System validates data and creates the user       |
|       6       | Confirmation message is shown; user appears in the list |

#### Scenario 4.2: Editing an existing user role


|  Scenario 4.2  |                                                       |
| :--------------: | :------------------------------------------------------: |
|  Precondition  | The admin is authenticated and a user to modify exists |
| Post condition |          The selected user's role is updated          |
|     Step#     |                      Description                      |
|       1       |      Admin accesses the "User Management" section      |
|       2       |                Selects an existing user                |
|       3       |                     Clicks "Edit"                     |
|       4       |  Changes the user’s role from "Viewer" to "Operator"  |
|       5       |                     Clicks "Save"                     |
|       6       | System updates the user's role and shows confirmation |

#### Scenario 4.3: Deleting an existing user


|  Scenario 4.3  |                                                             |
| :--------------: | :------------------------------------------------------------: |
|  Precondition  |    The admin is authenticated and a user to modify exists    |
| Post condition |                 The selected user is deleted                 |
|     Step#     |                         Description                         |
|       1       |         Admin accesses the "User Management" section         |
|       2       |                   Selects an existing user                   |
|       3       |                       Clicks "Delete"                       |
|       4       |          System validates data and deletes the user          |
|       5       | Confirmation message is shown; user disappears from the list |

---

### Use case 5, UC5 - Network Management


| Actors Involved |                             Admin, Operator                             |
| :----------------: | :-----------------------------------------------------------------------: |
|   Precondition   |                  User is authenticated and authorized                  |
|  Post condition  |                A network is created, updated or removed                |
| Nominal Scenario | User defines a unique code and metadata; system validates and stores it |
|     Variants     |                Optional network description or grouping                |
|    Exceptions    |                 Duplicate network code; invalid format                 |

#### Scenario 5.1: Creating a new network


|  Scenario 5.1  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |                  A new network is created                  |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Newtork Management" section |
|       2       |                 Click on "Add new network"                 |
|       3       |              Fills code, name and description              |
|       4       |                        Clicks "Save"                        |
|       5       |        System validates data and creates the network        |
|       6       | Confirmation message is shown; network appears in the list |

#### Scenario 5.2: Retrieve a specific network


|  Scenario 5.2  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |              An existing network is retrieved              |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Newtork Management" section |
|       2       |                 Selects an existing network                 |
|       3       |                     Click on "Retrieve"                     |
|       4       |        System returns data of that specific network        |

#### Scenario 5.3: Retrieve all networks


|  Scenario 5.3  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |             All existing networks are retrieved             |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Newtork Management" section |
|       2       |              Click on "Retrieve all networks"              |
|       3       |  System returns a list of all networks and their own data  |

#### Scenario 5.4: Update an existing network


|  Scenario 5.4  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |               An existing network is updated               |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Newtork Management" section |
|       2       |                 Selects an existing network                 |
|       3       |                       Click on "Edit"                       |
|       4       |           Changes newtork's code/name/description           |
|       5       |                        Clicks "Save"                        |
|       6       |  System updates the newtork fields and shows confirmation  |

#### Scenario 5.5: Delete an existing network


|  Scenario 5.5  |                                                                 |
| :--------------: | :---------------------------------------------------------------: |
|  Precondition  |               Admin or operator is authenticated               |
| Post condition |                 An existing network is deleted                 |
|     Step#     |                           Description                           |
|       1       |   Admin or operator accesses the "Newtork Management" section   |
|       2       |                   Selects an existing network                   |
|       3       |                       Clicks on "Delete"                       |
|       4       |          System validates data and deletes the network          |
|       5       | Confirmation message is shown; network disappears from the list |

---

### Use case 6, UC6 - Gateway Management


| Actors Involved |                      Admin, Operator                      |
| :----------------: | :---------------------------------------------------------: |
|   Precondition   |                  Selected network exists                  |
|  Post condition  |      Gateway is correctly associated to the network      |
| Nominal Scenario | User adds/updates/removes a gateway using its MAC address |
|     Variants     |      Physical replacement of gateway with re-linking      |
|    Exceptions    |           MAC already exists; gateway not found           |

#### Scenario 6.1: Creating a new gateway associated to a network


|  Scenario 6.1  |                                                                         |
| :--------------: | :-----------------------------------------------------------------------: |
|  Precondition  |     The Operator is authenticated and has selected a valid network     |
| Post condition |        A new gateway is added and linked to the selected network        |
|     Step#     |                               Description                               |
|       1       | Operator navigates to the selected network's gateway management section |
|       2       |                          Clicks "Add Gateway"                          |
|       3       |           Enters gateway MAC address and optional description           |
|       4       |                              Clicks "Save"                              |
|       5       |                   System validates MAC address format                   |
|       6       |               Gateway is saved and displayed in the list               |

#### Scenario 6.2: Editing an existing gateway


|  Scenario 6.2  |                                                                   |
| :--------------: | :-----------------------------------------------------------------: |
|  Precondition  | The Operator is authenticated and an existing gateway is selected |
| Post condition |               The gateway's information is updated               |
|     Step#     |                            Description                            |
|       1       |        Operator accesses the "Gateway Management" section        |
|       2       |                  Selects a gateway from the list                  |
|       3       |                           Clicks "Edit"                           |
|       4       |                 Modifies the name or description                 |
|       5       |                           Clicks "Save"                           |
|       6       |               System updates and shows confirmation               |

#### Scenario 6.3: Deleting an existing gateway


|  Scenario 6.3  |                                                                 |
| :--------------: | :---------------------------------------------------------------: |
|  Precondition  |       The Operator is authenticated and a gateway exists       |
| Post condition |         The selected gateway is removed from the system         |
|     Step#     |                           Description                           |
|       1       |       Operator accesses the "Gateway Management" section       |
|       2       |                 Selects a gateway from the list                 |
|       3       |                         Clicks "Delete"                         |
|       4       |          System validates data and deletes the gateway          |
|       5       | Confirmation message is shown; gateway disappears from the list |

#### Scenario 6.4: Retrieve a specific gateway


|  Scenario 6.4  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |              An existing gateway is retrieved              |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Gateway Management" section |
|       2       |                 Selects an existing gateway                 |
|       3       |                     Click on "Retrieve"                     |
|       4       |        System returns data of that specific gateway        |

#### Scenario 6.5: Retrieve all gateways


|  Scenario 6.5  |                                                             |
| :--------------: | :-----------------------------------------------------------: |
|  Precondition  |             Admin or operator is authenticated             |
| Post condition |             All existing gateways are retrieved             |
|     Step#     |                         Description                         |
|       1       | Admin or operator accesses the "Gateway Management" section |
|       2       |              Click on "Retrieve all gateways"              |
|       3       |  System returns a list of all gateways and their own data  |

---

### Use case 7, UC7 - Sensor Management


| Actors Involved |                     Admin, Operator                     |
| :----------------: | :--------------------------------------------------------: |
|   Precondition   |                  Target gateway exists                  |
|  Post condition  | Sensor is linked to gateway and configuration is updated |
| Nominal Scenario |  User assigns sensor to gateway using its MAC and type  |
|     Variants     |         Sensor replacement or calibration update         |
|    Exceptions    |         Duplicate MAC; incompatible sensor type         |

#### Scenario 7.1: Adding a sensor to a gateway


|  Scenario 7.1  |                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |                       Target gateway exists                       |
| Post condition |      Sensor is linked to gateway and configuration is updated      |
|     Step#     |                            Description                            |
|       1       |                 Admin/Operator enters the endpoint                 |
|       2       |                   The system shows the interface                   |
|       3       | Admin/Operator inserts network code and gateway mac of the gateway |
|       4       |   Admin/Operator inserts the required informations of the sensor   |
|       5       |          The system sends a response message (ok o error)          |

---

### Use case 8, UC8 - Measurement Submission


| Actors Involved |                    System (Gateway)                    |
| :----------------: | :-------------------------------------------------------: |
|   Precondition   |              Sensor is linked to a gateway              |
|  Post condition  | Measurement is validated, stored and timestamped in UTC |
| Nominal Scenario |  Gateway submits value and timestamp; system stores it  |
|     Variants     |           Submitting a batch of measurements           |
|    Exceptions    |        Unknown sensor; invalid timestamp format        |

#### Scenario 8.1: Submitting a measurement


|  Scenario 8.1  |                                                         |
| :--------------: | :-------------------------------------------------------: |
|  Precondition  |              Sensor is linked to a gateway              |
| Post condition | Measurement is validated, stored and timestamped in UTC |
|     Step#     |                       Description                       |
|       1       |  Gateway sends timestamp and value of the measurement  |
|       2       |                   System validates it                   |
|       3       |               System eventually stores it               |

---

### Use case 9, UC9 - Measurement Data Consultation


| Actors Involved |                 Admin, Operator, Viewer                 |
| :----------------: | :-------------------------------------------------------: |
|   Precondition   |  User is authenticated and has data access permissions  |
|  Post condition  |       Requested measurements are retrieved in UTC       |
| Nominal Scenario | User selects sensor and date range; system returns data |
|     Variants     |         Export to file, graphical visualization         |
|    Exceptions    |          No data available; invalid parameters          |

#### Scenario 9.1: Statistical Analysis for a Single Sensor


|  Scenario 9.1  |                                                                  |
| :--------------: | :---------------------------------------------------------------: |
|  Precondition  |       User is authenticated and has data access permissions       |
| Post condition |    Statistics for the requested sensor are calculated and displayed    |
|     Step#     |                            Description                            |
|       1       |             User accesses the "Statistical Analysis" section             |
|       2       |              User selects a specific network, gateway, and sensor              |
|       3       |           User specifies a time range for the analysis (optional)           |
|       4       |                    User clicks "Calculate Statistics"                    |
|       5       |                System validates the request parameters                |
|       6       |         System calculates mean (μ) and variance (σ²) of measurements         |
|       7       |      System calculates upper threshold (μ + 2σ) and lower threshold (μ - 2σ)      |
|       8       |              System displays the calculated statistics to the user              |

#### Scenario 9.2: Statistical Analysis for Multiple Sensors in a Network


|  Scenario 9.2  |                                                                  |
| :--------------: | :---------------------------------------------------------------: |
|  Precondition  |       User is authenticated and has data access permissions       |
| Post condition |    Statistics for all requested sensors are calculated and displayed    |
|     Step#     |                            Description                            |
|       1       |             User accesses the "Statistical Analysis" section             |
|       2       |                      User selects a specific network                      |
|       3       |        User optionally filters which sensors to include in the analysis        |
|       4       |           User specifies a time range for the analysis (optional)           |
|       5       |                User clicks "Calculate Network Statistics"                |
|       6       |                System validates the request parameters                |
|       7       |      System calculates statistics (μ, σ², thresholds) for each selected sensor      |
|       8       |            System displays the calculated statistics grouped by sensor            |

---

### Use case 10, UC10 - Outlier Detection


| Actors Involved |                              System                              |
| :----------------: | :-----------------------------------------------------------------: |
|   Precondition   |                Thresholds for a sensor are defined                |
|  Post condition  |                    Outlier values are flagged                    |
| Nominal Scenario | New measurements are compared to thresholds; anomalies are marked |
|     Variants     |       Alert triggering, storing outliers in a separate list       |
|    Exceptions    |           Missing thresholds; invalid statistical model           |

#### Scenario 10.1: Retrieving outliers for a single sensor


|  Scenario 10.1  |                                                                 |
| :--------------: | :--------------------------------------------------------------: |
|  Precondition  | Thresholds are defined for the sensor and measurements exist |
| Post condition |       Outlier measurements for the sensor are displayed       |
|     Step#     |                         Description                         |
|       1       |      User accesses the "Statistical Analysis" section      |
|       2       |             User selects a sensor from the list             |
|       3       |    User specifies the time range for outlier detection    |
|       4       |                   User clicks "Get Outliers"                   |
|       5       | System compares measurements against defined thresholds |
|       6       |       System identifies and marks outlier values       |
|       7       |   System displays the outliers with timestamp and value   |

#### Scenario 10.2: Retrieving outliers for a given network


|  Scenario 10.2  |                                                                   |
| :--------------: | :----------------------------------------------------------------: |
|  Precondition  | Thresholds are defined for sensors in the network and data exists |
| Post condition |   Outlier measurements across the network sensors are displayed   |
|     Step#     |                           Description                           |
|       1       |        User accesses the "Statistical Analysis" section        |
|       2       |               User selects a network from the list               |
|       3       |      User specifies the time range for outlier detection      |
|       4       |                     User clicks "Get Outliers"                     |
|       5       |   System identifies all sensors belonging to the network   |
|       6       |  System compares all measurements against defined thresholds  |
|       7       |         System identifies and marks outlier values         |
|       8       | System displays the outliers grouped by sensor with timestamps |

---

### Use Case 11, UC11 - Topology Synchronization


| Actors Involved |                         Admin, Operator                         |
| :----------------: | :----------------------------------------------------------------: |
|   Precondition   |  Field device data exists and system representation is outdated  |
|  Post condition  | Software topology is updated to match the physical configuration |
| Nominal Scenario | User updates gateway/sensor mappings and saves new configuration |
|     Variants     |             Reassignment of sensors to new gateways             |
|    Exceptions    |      Inconsistent configuration; loss of device references      |

#### Scenario 11.1: Creating a New Network


| Scenario 11.1 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |               Admin or Operator is authenticated               |
| Post condition |         A new network is created in the system         |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |                    Clicks "Add New Network"                    |
|       3       |      Enters a unique network code that doesn't already exist      |
|       4       |           Enters network name and optional description           |
|       5       |                         Clicks "Save"                         |
|       6       |             System validates the network information             |
|       7       |                   System creates the network                   |
|       8       |  System displays a success message and shows the network in the list  |

#### Scenario 11.2: Updating an Existing Network


| Scenario 11.2 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |    Admin or Operator is authenticated and a network exists    |
| Post condition |           The network information is updated           |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                        Clicks "Edit"                        |
|       4       | Modifies network code, name, or description as needed |
|       5       |                         Clicks "Save"                         |
|       6       |             System validates the network information             |
|       7       |          System updates the network and shows confirmation          |

#### Scenario 11.3: Deleting a Network


| Scenario 11.3 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |    Admin or Operator is authenticated and a network exists    |
| Post condition |      The network and all its associated gateways and sensors are removed      |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                       Clicks "Delete"                       |
|       4       |       System shows a confirmation dialog warning about cascade deletion       |
|       5       |                   User confirms the deletion                   |
|       6       |     System deletes the network and all associated gateways and sensors     |
|       7       |                System shows a success message                |

#### Scenario 11.4: Adding a Gateway to a Network


| Scenario 11.4 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  |    Admin or Operator is authenticated and a network exists    |
| Post condition |      A new gateway is added to the selected network      |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |                    Clicks "Add New Gateway"                    |
|       5       |   Enters gateway MAC address (must be unique across all networks)   |
|       6       |           Enters gateway name and optional description           |
|       7       |                         Clicks "Save"                         |
|       8       |              System validates the gateway information              |
|       9       |             System adds the gateway to the network             |
|      10      |   System displays success message and shows the gateway in the list   |

#### Scenario 11.5: Updating a Gateway


| Scenario 11.5 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  | Admin or Operator is authenticated and a gateway exists in a network |
| Post condition |           The gateway information is updated and possibly moved to a different network           |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |              Selects an existing gateway from the list              |
|       5       |                        Clicks "Edit"                        |
|       6       |      Updates MAC address, name, or description as needed      |
|       7       |      Optionally selects a different network from dropdown to move gateway      |
|       8       |                         Clicks "Save"                         |
|       9       |              System validates the gateway information              |
|      10      |        System updates the gateway and moves it if a new network is selected        |
|      11      |        System displays success message with details of the update        |

#### Scenario 11.6: Removing a Gateway from a Network


| Scenario 11.6 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  | Admin or Operator is authenticated and a gateway exists in a network |
| Post condition |      The gateway and all its associated sensors are removed from the network      |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |              Selects an existing gateway from the list              |
|       5       |                       Clicks "Delete"                       |
|       6       |       System shows a confirmation dialog warning about cascade deletion       |
|       7       |                   User confirms the deletion                   |
|       8       |        System deletes the gateway and all associated sensors        |
|       9       |                System shows a success message                |

#### Scenario 11.7: Adding a Sensor to a Gateway


| Scenario 11.7 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  | Admin or Operator is authenticated and a gateway exists in a network |
| Post condition |      A new sensor is added to the selected gateway      |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |              Selects an existing gateway from the list              |
|       5       |                     Clicks "View Sensors"                     |
|       6       |                    Clicks "Add New Sensor"                    |
|       7       |     Enters sensor MAC address (must be unique across all gateways)     |
|       8       |            Enters sensor name and optional description            |
|       9       | Specifies the variable type (e.g., temperature) and unit (e.g., C) |
|      10      |                         Clicks "Save"                         |
|      11      |              System validates the sensor information              |
|      12      |               System adds the sensor to the gateway               |
|      13      |    System displays success message and shows the sensor in the list    |

#### Scenario 11.8: Updating a Sensor


| Scenario 11.8 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  | Admin or Operator is authenticated and a sensor exists in a gateway |
| Post condition |            The sensor information is updated and potentially reassigned to another gateway            |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|       2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |              Selects an existing gateway from the list              |
|       5       |                     Clicks "View Sensors"                     |
|       6       |               Selects an existing sensor from the list               |
|       7       |                        Clicks "Edit"                        |
|       8       |       Updates MAC address, name, description, variable type, or unit as needed       |
|       9       |       Optionally selects a different gateway from dropdown to reassign sensor       |
|      10      |                         Clicks "Save"                         |
|      11      |              System validates the sensor information              |
|      12      |        System updates the sensor and reassigns it if a new gateway is selected        |
|      13      |        System displays success message with details of the update        |

#### Scenario 11.9: Removing a Sensor from a Gateway


| Scenario 11.9 |                                                                     |
| :--------------: | :------------------------------------------------------------------: |
|  Precondition  | Admin or Operator is authenticated and a sensor exists in a gateway |
| Post condition |      The sensor is removed from the gateway      |
|     Step#     |                          Description                          |
|       1       |      User navigates to the "Network Management" section      |
|        2       |               Selects an existing network from the list               |
|       3       |                     Clicks "View Gateways"                     |
|       4       |              Selects an existing gateway from the list              |
|       5       |                     Clicks "View Sensors"                     |
|       6       |               Selects an existing sensor from the list               |
|       7       |                       Clicks "Delete"                       |
|       8       |              System shows a confirmation dialog              |
|       9       |                   User confirms the deletion                   |
|      10      |                      System deletes the sensor                      |
|      11      |                System shows a success message                |

# Glossary

[![](https://img.plantuml.biz/plantuml/svg/hLN1Rjim3BtdAuYSsY4DjcjF3TgYs82jmvfXPzLY7AAow4bqWcpOlu-KaooUqzDsiarIr7jy97sJnINfcZ0Hae3mW7pBKH87UDfbmGQku25mpYxju3QudE6EN9rSCvbKvVCJofRJ2_oSWCPMxF4QiYIATJ54rmmD7dELg1NYUBJ_caGMX4JrMe1NXvmQlu30DLKkG9suQpNO_BKJtBfTda72Dc76A7rw1mr74hQibhohf4i85pYlvpDekaWLjIwGx2xd4umUxDu3auS-wvv9uwg5zvey_pkVVUR2frtlSY7aSKEL1c65j36ytec3LU86b53cb8sGObnnshhaBOG4X47M2BceCoRnL8x-1mvctxX4xZaCWxM8yYhJ_lgpH1jqkIl2ODnGujYeR2vexFVEgO12c27G2u8IQp4vasu65Aj0qHcs6Q1KOyeVIsAqT8SkJAWLzml5gKL5eGRtV4AdP5Q1dHG3vSTE0c6wXcVcW2wE69raBxIoCj11AMArJ7gdAiZ9euVddJPWhzrCOmrvLsGp03feJLlqB2ZEA2TEyfv0cSexXVuN0JrpnggLZQUiYcon6Z3jMYtfSgsziERWJps1jsSy8s4DdSRRax8KOLrqGJNEvc_-b2d3bcHDiSnZJHkCfG1gZPwtO-9VCnuQjjFNKNUs6gJhm0-CiciroeukzMq4rnmcLmHNLTofIfhQs_3ejyx3O8O0ljYvh9tQ6ZYEnQtNSaNMIA3xSA0OnguvNbwmEzyKnbmwjup0Xb0hUnPQmGnmRsayhYYMBj4xhG3bjbnQPGysu0P37bTkoIzQtBvqOk-lpcM9j89qUaiq-MoW-aDmyU7RybBRM0SkAbct4WLXUpUEhxnFYTFTyd6mxodA-SMYRPzTZQ_2EcJh6ojwMtC_50AQNH7bbcD6su2mSXJKi_Zy7hJtXjKu_8EcxwPmTGNJj_Fvc-bnwnxs-j2xtrJxVJdqdSxysO1-6YQbSmyUVHobdTmeEFkh_WO0)](https://editor.plantuml.com/uml/hLN1Rjim3BtdAuYSsY4DjcjF3TgYs82jmvfXPzLY7AAow4bqWcpOlu-KaooUqzDsiarIr7jy97sJnINfcZ0Hae3mW7pBKH87UDfbmGQku25mpYxju3QudE6EN9rSCvbKvVCJofRJ2_oSWCPMxF4QiYIATJ54rmmD7dELg1NYUBJ_caGMX4JrMe1NXvmQlu30DLKkG9suQpNO_BKJtBfTda72Dc76A7rw1mr74hQibhohf4i85pYlvpDekaWLjIwGx2xd4umUxDu3auS-wvv9uwg5zvey_pkVVUR2frtlSY7aSKEL1c65j36ytec3LU86b53cb8sGObnnshhaBOG4X47M2BceCoRnL8x-1mvctxX4xZaCWxM8yYhJ_lgpH1jqkIl2ODnGujYeR2vexFVEgO12c27G2u8IQp4vasu65Aj0qHcs6Q1KOyeVIsAqT8SkJAWLzml5gKL5eGRtV4AdP5Q1dHG3vSTE0c6wXcVcW2wE69raBxIoCj11AMArJ7gdAiZ9euVddJPWhzrCOmrvLsGp03feJLlqB2ZEA2TEyfv0cSexXVuN0JrpnggLZQUiYcon6Z3jMYtfSgsziERWJps1jsSy8s4DdSRRax8KOLrqGJNEvc_-b2d3bcHDiSnZJHkCfG1gZPwtO-9VCnuQjjFNKNUs6gJhm0-CiciroeukzMq4rnmcLmHNLTofIfhQs_3ejyx3O8O0ljYvh9tQ6ZYEnQtNSaNMIA3xSA0OnguvNbwmEzyKnbmwjup0Xb0hUnPQmGnmRsayhYYMBj4xhG3bjbnQPGysu0P37bTkoIzQtBvqOk-lpcM9j89qUaiq-MoW-aDmyU7RybBRM0SkAbct4WLXUpUEhxnFYTFTyd6mxodA-SMYRPzTZQ_2EcJh6ojwMtC_50AQNH7bbcD6su2mSXJKi_Zy7hJtXjKu_8EcxwPmTGNJj_Fvc-bnwnxs-j2xtrJxVJdqdSxysO1-6YQbSmyUVHobdTmeEFkh_WO0)


# System Design

![system-design](http://www.plantuml.com/plantuml/svg/TL3BJiD03BpxAqOzWQ0_q0Fg2n08rD87lVJY9bPPDTcDrfjM5Ug_esmIQ0NSRC-Cnvw-1lQXp3FIdR45Uyx1IN1-7ewPW0-YBXSYYaDqteqSn7V0YhfiWKaXdeEheRPfmK6Q6siq_33YXCXB4jXkCq5dgU8n7NNmIG1mXgnaWq5HHDrADeEYeDE5T2v-NnrLAS_6GqvsOjErlHfCdt23vzK2N8QFwxYfGIybazahCZx6PI0WvS0RrihZxSK4mNWOnUCX0QTVPrXrNYEXgS_XHmvou6E4cvge3X7Txbtp6df8dDKo2z6SsYWlAJbRtWgiX8FpExrTMsphbGgsAJJQKqpvJsMfufMe6LUC9W_qCBkVB_0T6RL0HHeFqSDejXp3nRkCiqhKF1iPpMULax2MNdAnGR6ss1j6mfjCgENyO-lsuh4otGT3r1URbdds1G00 "system-design")



# Deployment Diagram

The GeoControl system has a client-server architecture with two main deployment nodes:

1. **Server GeoControl**: This node hosts the GeoControl Backend, which provides all the REST API services described in the Swagger specification. The backend handles authentication, user management, and all the data processing related to networks, gateways, sensors, and measurements.
2. **User PC**: This node hosts the GeoControl Frontend application, which provides the user interface for administrators, operators, and viewers. The frontend communicates with the backend through API calls over an internet connection.

The communication between these nodes occurs via:

- Internet connection between the Server GeoControl and User PC nodes
- RESTful API calls between the GeoControl Backend and Frontend artifacts

![Deployment diagram](https://www.plantuml.com/plantuml/png/TP3BQiCm44Nt-efBze6sownIjrXqPp3vW46QkCBIo8mcBQ7qtuj37u6sstFctCNicv7QgMGyyfBhkR0OOg99gJXBblalaVbei0fDq_DAbOEbAiwrESb2IWKBXPac7YZ691DkRwwSrCYD5znTGoMPVq4ALdMqSsRGAxTQsBcrncPaVM65vnggcDQy0JMC7cyE8BLqf63O_7Xq56QMUBdpdNl_MZeqLWmF5tuO_kzxhMBV0_qwC7fijskqGn9Z5JQ4AlBv3j-jslVOuNvuGg2SctDxbdWg-GC0)
