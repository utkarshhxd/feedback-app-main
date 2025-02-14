import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  CircularProgress,
  Pagination,
  Box,
  Card,
  CardContent,
  IconButton,
  Grid,
  Divider,
  Input,
  Avatar
} from "@mui/material";
import { AddCircle, Search, MyLocation } from "@mui/icons-material";

function App() {
  const [feedback, setFeedback] = useState([]);
  const [category, setCategory] = useState("Bug");
  const [status, setStatus] = useState("All");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(""); // New State for Location
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/feedback")
      .then((res) => {
        setFeedback(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load feedback.");
        setLoading(false);
      });
  }, []);

  const submitFeedback = () => {
    if (description.trim() === "") {
      alert("Please enter a description before submitting!");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location); // Send location
    if (image) {
      formData.append("image", image);
    }

    axios
      .post("http://localhost:5000/submit-feedback", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((res) => {
        setFeedback([res.data.feedback, ...feedback]);
        setDescription("");
        setImage(null);
        setLocation("");
      })
      .catch((err) => setError("Failed to submit feedback."));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocation(data.display_name || `${latitude}, ${longitude}`);
        } catch (error) {
          alert("Failed to fetch location.");
        }
        setFetchingLocation(false);
      },
      () => {
        alert("Failed to get your location.");
        setFetchingLocation(false);
      }
    );
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Submit Feedback
      </Typography>

      <Grid container spacing={4} sx={{ height: "500px", display: "flex", alignItems: "stretch" }}>
        {/* Left Side: Feedback Form */}
        <Grid item xs={12} md={5} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Paper sx={{ padding: 3, borderRadius: 2, flex: 1, boxShadow: 3 }}>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                <MenuItem value="Bug">Bug</MenuItem>
                <MenuItem value="Feature Request">Feature Request</MenuItem>
                <MenuItem value="General Feedback">General Feedback</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Problem Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ marginBottom: 2 }}
            />

            {/* Location Input & Button */}
            <TextField
              fullWidth
              label="Enter Location (Optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={fetchLocation}
              disabled={fetchingLocation}
              startIcon={<MyLocation />}
              sx={{ marginBottom: 2 }}
            >
              {fetchingLocation ? "Fetching Location..." : "Use My Location"}
            </Button>

            {/* Image Upload */}
            <Button variant="contained" component="label" color="secondary" fullWidth sx={{ marginBottom: 2 }}>
              Add Image
              <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} sx={{ display: "none" }} />
            </Button>

            {/* Image Preview */}
            {image && (
              <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "center" }}>
                <Avatar src={URL.createObjectURL(image)} sx={{ width: 80, height: 80, borderRadius: 0 }} />
              </Box>
            )}

            {/* Submit Button - Inside the Paper */}
            <Button variant="contained" color="primary" fullWidth onClick={submitFeedback}>
              Submit Feedback
            </Button>
          </Paper>
        </Grid>

        {/* Right Side: Feedback List */}
        <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Paper sx={{ padding: 3, maxHeight: "500px", overflowY: "auto", borderRadius: 2, boxShadow: 3, flex: 1 }}>
            <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
              Feedback Status
            </Typography>

            {loading ? (
              <CircularProgress sx={{ display: "block", margin: "auto" }} />
            ) : (
              <List>
                {feedback
                  .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                  .map((item) => (
                    <ListItem key={item.id} sx={{ marginBottom: 2 }}>
                      <Card sx={{ width: "100%", borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                          <ListItemText
                            primary={<Typography variant="h6">{`${item.category}: ${item.description}`}</Typography>}
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                {`Status: ${item.status} | Location: ${item.location} | Submitted on: ${new Date(item.date).toLocaleString()}`}
                              </Typography>
                            }
                          />
                          {item.image && (
                            <Avatar src={`http://localhost:5000${item.image}`} sx={{ width: 80, height: 80, marginTop: 1 }} />
                          )}
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
              </List>
            )}

            <Pagination
              count={Math.ceil(feedback.length / ITEMS_PER_PAGE)}
              page={page}
              onChange={(e, v) => setPage(v)}
              sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
