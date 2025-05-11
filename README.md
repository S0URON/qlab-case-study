# Project Feature Documentation

This document outlines the key features and structure of the "Q\*Lab" application.

## 1. Overview

The project is a web application designed for managing and analyzing manufacturing defects and anomalies. It allows users to view defect data, identify potential anomalies through various algorithms, flag them, and review flagged anomalies. The application features a data-driven approach with visualizations to aid in quality control processes.

## 2. Core Technologies

- **Frontend Framework**: React with TypeScript (see `package.json`)
- **Build Tool**: Vite (see `vite.config.ts`)
- **UI Components**: Material-UI (MUI) (configured in `App.tsx`)
- **Routing**: React Router DOM (configured in `App.tsx`)
- **Data Visualization**: MUI X Charts (`@mui/x-charts`) (used in `defectChartsView.tsx`)
- **Linting**: ESLint with TypeScript and React plugins (configured in `eslint.config.js`)

## 3. Main Application Structure

The application is structured around two primary sections accessible via a navigation drawer:

- **Defects Page** (`/`)
- **Anomalies Page** (`/anomalies`)

The main layout is managed by the `Home` component (from `home.tsx`), which includes a `ClippedDrawer` component (from `drawer.tsx`) for navigation.

### 3.1. Styling and Theming

- A custom MUI theme is applied globally in `App.tsx`.
- The theme uses specific brand colors (e.g., BMW dark blue `#003D78`, BMW teal `#0066B1`) and the "BMW Type Next" font family.
- Font files are located in the `public/fonts` directory.

## 4. Features

### 4.1. Defects Management (see `defects.tsx`)

- **Data Source**: Defect data is fetched from `http://localhost:3000/defects` using the `getDefectsApi` function (from `defects.api.ts`).
- **Tabular View** (implemented in the `DefectDataTable` component from `defectsDataTable.tsx`):
  - Displays a comprehensive list of defects in a sortable and paginated data grid.
  - Columns include Date, Time, Defect Name, Station, Part of the Car, Reporter Name, Part Number, Severity Rating, Car Model, Motor Type, Design Package, Production Shift, Resolution Time, Root Cause Identified, and Defect Category.
  - Dates are formatted using a utility function `formatDate` (from `utils.ts`).
- **Graphical View** (implemented in the `DefectChartsView` component from `defectChartsView.tsx`):
  - Provides various charts to visualize defect data, including:
    - Top 5 defects by defect count (Bar Chart).
    - Average Resolution Time by Station (Line Chart with mean).
    - Defect Rates per Car Model (Pie Chart).
    - Defect Rates per Motor Type (Pie Chart).
    - Defect Rates per Design Package (Pie Chart).
    - Average Resolution Time by Severity (Line Chart with mean).
  - Calculates and displays various metrics like overall average resolution time, average resolution per severity/defect/station/part, defect counts per various categories, etc. (using the `calculateDefectMetrics` function from `metrics.ts`).
- **Anomaly Flagging**:
  - **Manual Flagging**: Users can select a defect from the table and manually flag it as an anomaly. This involves providing a note and the suspected value/field. The flagged anomaly is sent to `http://localhost:3000/anomalies` via the `flagAnomalyApi` function (from `anomalies.api.ts`).
  - **Automatic Flagging**:
    - The system can automatically flag anomalies based on selected algorithms and parameters using the `autoFlagAnomalies` function (from `utils.ts`).
    - Supported algorithms (defined in `utils.ts`):
      - `detectAnomaliesByFrequency`: Flags defects based on their occurrence frequency compared to typical occurrences.
      - `detectAnomaliesByZScore`: Flags defects if a numerical field (e.g., `severityRating`) has a Z-score above a certain threshold.
      - `detectAnomaliesByIQR`: Flags defects if a numerical field (e.g., `resolutionTime`) falls outside the Interquartile Range (IQR) bounds.
    - Users can select an algorithm, a target field, and a control value to trigger the auto-flagging process.

### 4.2. Anomalies Management (see `anomlies.tsx`)

- **Data Source**: Anomaly data is fetched from `http://localhost:3000/anomalies` using the `getAnomaliesApi` function (from `anomalies.api.ts`).
- **Anomalies Table** (implemented in the `AnomalieDataTable` component from `anomaliesDataTable.tsx`):
  - Displays a list of flagged anomalies in a data grid.
  - Columns include Date, Time, Defect ID, Suspected Field, Suspected Value, Status, Flagged By, and Note.
- **Unflag Anomaly**:
  - Users can select an anomaly from the table and unflag it (effectively deleting it).
  - This action calls the `unflagAnomalyApi` function (from `anomalies.api.ts`) to remove the anomaly entry via a DELETE request to `http://localhost:3000/anomalies/:id`.

## 5. Utility Functions (see `utils.ts`)

The `src/utils/utils.ts` file contains several helper functions crucial for data processing and feature implementation:

- **Date Formatting**: `formatDate`.
- **Anomaly Detection Algorithms**:
  - `detectAnomaliesByFrequency`
  - `detectAnomaliesByZScore`
  - `detectAnomaliesByIQR`
- **Defect Data Analysis**:
  - `calculateDefectRatesPerModel`
  - `getTop5MostCommonDefects`
  - `modelDefectRate`
  - `motorTypeDefectRate`
  - `packageDefectRate`
  - `defectsPerStation`
  - `calculateDefectMetrics` (calculates a wide range of metrics for graphical display).

## 6. API Interaction

The application interacts with a backend API (assumed to be running on `http://localhost:3000`) for managing defects and anomalies.

- **Defects API** (defined in `defects.api.ts`):
  - `GET /defects`: Fetches all defect records.
- **Anomalies API** (defined in `anomalies.api.ts`):
  - `POST /anomalies`: Creates a new anomaly record.
  - `GET /anomalies`: Fetches all anomaly records.
  - `DELETE /anomalies/:id`: Deletes an anomaly record.

## 7. Project Configuration

- **Vite Configuration** (`vite.config.ts`): Standard Vite setup with the React plugin.
- **TypeScript Configuration**:
  - `tsconfig.json`: Main TypeScript configuration.
  - `tsconfig.app.json`: Specific configuration for the application code in `src`.
  - `tsconfig.node.json`: Configuration for Node.js-specific files like `vite.config.ts`.
- **ESLint Configuration** (`eslint.config.js`): Configures linting rules for JavaScript/TypeScript and React, including rules for React Hooks and React Refresh.
- **Package Management** (`package.json`): Lists project dependencies and scripts (`dev`, `build`, `lint`, `preview`).

## 8. Reflective Write-up

This section discusses potential limitations of the current Q\*Lab application, measures for ensuring robustness, and considerations for a production deployment.

**Potential Limitations:**

The current anomaly detection algorithms (Frequency, Z-Score, IQR) are foundational and may have limitations. They primarily focus on univariate analysis and might not capture complex, multivariate anomalies where relationships between different fields are indicative of an issue. For instance, a specific `defectName` might be normal on its own, but anomalous when combined with a particular `station` and `carModel`. The system's reliance on a static set of rules or thresholds for these algorithms might also lead to false positives or negatives if the underlying data distribution changes significantly over time without recalibration. Furthermore, the manual flagging process, while flexible, is subjective and depends on user expertise, potentially leading to inconsistencies. The current data source is a single JSON file fetched via an API, which might not scale well for very large datasets or real-time data streams.

**Ensuring Robustness:**

System robustness is currently approached through several means. TypeScript's static typing helps catch errors during development. ESLint enforces code quality and consistency, reducing potential runtime issues. The backend API (assumed) provides a centralized point for data access, and error handling is implemented in API calls within the frontend (e.g., displaying alerts on fetch failures). The utility functions for calculations and anomaly detection are designed to handle edge cases, such as empty datasets or non-numeric inputs where applicable. User input validation in forms (e.g., for flagging anomalies) also contributes to robustness by preventing malformed data submission. Regular code reviews and testing (though not explicitly documented here, assumed as good practice) would further enhance this.

**Improvements for Production Deployment:**

For a production environment, several improvements would be crucial.

1.  **Advanced Anomaly Detection**: Incorporate more sophisticated machine learning models (e.g., clustering, autoencoders, time-series anomaly detection) that can learn from data and identify complex patterns. Implement a mechanism for model retraining and evaluation.
2.  **Scalable Data Infrastructure**: Transition from a simple API serving static data to a robust database system (e.g., PostgreSQL, Elasticsearch) capable of handling large volumes of data, complex queries, and real-time ingestion.
3.  **Enhanced Monitoring & Alerting**: Implement comprehensive logging, monitoring of application performance, and real-time alerting for critical system errors or newly detected high-priority anomalies.
4.  **User Roles & Permissions**: Introduce role-based access control (RBAC) to manage what different users can see and do within the application.
5.  **Audit Trails**: Implement detailed audit trails for all significant actions, especially for flagging and unflagging anomalies, to ensure accountability and traceability.
6.  **Configuration Management**: Allow administrators to configure anomaly detection parameters, thresholds, and rules through a UI rather than hardcoding them.
7.  **CI/CD Pipeline**: Establish a robust CI/CD pipeline for automated testing, building, and deployment to ensure reliability and speed of updates.
8.  **Feedback Loop**: Implement a system for users to provide feedback on the accuracy of flagged anomalies, which can be used to refine detection models.
