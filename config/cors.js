export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("not  allowed  by cors"));
    }
  },
  Credential: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-type", "authorization"],
};
