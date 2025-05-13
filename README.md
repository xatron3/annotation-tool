# Annotation Tool

This is a web-based annotation tool built with [Next.js](https://nextjs.org) and [Fabric.js](http://fabricjs.com). The tool allows users to upload an image, draw polygons on it, label the polygons, and reset the canvas for new annotations.

## Features

- **Image Upload and Display**: Load an image into the canvas and scale it to fit.
- **Polygon Drawing**: Add points to create polygons on the canvas.
- **Labeling**: Label polygons with custom text.
- **Reset Functionality**: Clear the canvas and reload the image for new annotations.
- **Interactive UI**: Buttons to start drawing, close and label polygons, and reset the canvas.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Prisma CLI](https://www.prisma.io/docs/getting-started/quickstart)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd annotation-tool
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the database:

   - Create a `.env` file in the root directory and add your database connection string:

     ```env
     DATABASE_URL="your-database-connection-string"
     ```

   - Run the Prisma migrations to set up the database schema:

     ```bash
     npx prisma migrate dev
     ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Prism

npx prisma migrate dev --name <migration_name>

npx prisma generate

### Building for Production

To build the app for production:

```bash
npm run build
```

The output will be in the `.next` directory. You can start the production server with:

```bash
npm start
```

### Testing

To run tests (if applicable):

```bash
npm test
```

## Usage

1. **Start Drawing**: Click the "Start Polygon" button to begin drawing a polygon.
2. **Add Points**: Click on the canvas to add points to the polygon.
3. **Close and Label**: Click "Close & Label" to complete the polygon and add a label.
4. **Reset**: Click "Reset" to clear the canvas and reload the image.

## File Structure

- **`src/components/FabricCanvas.tsx`**: The main component for the canvas and drawing functionality.
- **`public/`**: Static assets like images.
- **`.next/`**: Build output (generated after running `npm run build`).

## Technologies Used

- **[Next.js](https://nextjs.org)**: React framework for building the app.
- **[Fabric.js](http://fabricjs.com)**: Canvas library for drawing and manipulating objects.
- **TypeScript**: For type safety and better developer experience.
- **Tailwind CSS**: For styling the UI.

## Known Issues

- Ensure the uploaded image URL is valid and accessible.
- The app currently does not support saving annotations to a database or exporting them.

## Future Enhancements

- Add support for saving and exporting annotations.
- Allow users to upload images directly from their local system.
- Add undo/redo functionality for drawing.
- Improve UI/UX with more customization options.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Contact

For questions or feedback, feel free to open an issue or reach out to the project maintainer.

```

### Notes:
- Replace `<repository-url>` with your actual repository URL.
- Add a `LICENSE` file if you want to include a license.
- If you have additional features or dependencies, include them in the relevant sections.
```
