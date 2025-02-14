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
import { AddCircle, Search } from "@mui/icons-material";

function App() {
  const [feedback, setFeedback] = useState([]);
  const [category, setCategory] = useState("Bug");
  const [status, setStatus] = useState("All");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [image, setImage] = useState(null); // State to store the uploaded image

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
    if (image) {
      formData.append("image", image);
    }

    axios
      .post("http://localhost:5000/submit-feedback", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((res) => {
        setFeedback([res.data.feedback, ...feedback]);
        setDescription(""); // Clear input after submit
        setImage(null); // Clear image after submit
      })
      .catch((err) => setError("Failed to submit feedback."));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredFeedback = feedback
    .filter(
      (item) =>
        (status === "All" || item.status === status) &&
        (item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Set the selected image
    }
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
              <Select value={category} onChange={handleCategoryChange} label="Category">
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

            {/* Custom File Upload Button */}
            <Button
              variant="contained"
              component="label"
              color="secondary"
              fullWidth
              sx={{
                marginBottom: 2,
                textTransform: "none",
                backgroundColor: "#9c27b0",
                '&:hover': { backgroundColor: "#7b1fa2" },
              }}
              startIcon={<AddCircle />}
            >
              Add Image
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                sx={{ display: "none" }} // Hide the default file input
              />
            </Button>

            {/* Image Preview */}
            {image && (
              <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "center" }}>
                <Avatar
                  src={URL.createObjectURL(image)}
                  sx={{ width: 80, height: 80, borderRadius: 0 }} // Square shape
                />
              </Box>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={submitFeedback}
              sx={{
                marginBottom: 2,
                backgroundColor: "#3f51b5",
                '&:hover': { backgroundColor: "#303f9f" },
              }}
              startIcon={<AddCircle />}
            >
              Submit Feedback
            </Button>
          </Paper>
        </Grid>

        {/* Right Side: Feedback List */}
        <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Paper sx={{ padding: 3, maxHeight: "500px", overflowY: "auto", borderRadius: 2, boxShadow: 3, flex: 1 }}>
            {/* Feedback Status Inside Paper */}
            <Typography variant="h5" align="center" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              Feedback Status
            </Typography>
            {error && <Snackbar open={true} message={error} />}

            {/* Search Feedback */}
            <TextField
              fullWidth
              label="Search Feedback"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ marginBottom: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <Search />
                  </IconButton>
                ),
              }}
            />

            {/* Status Filter */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Status">
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
              </Select>
            </FormControl>

            {loading ? (
              <CircularProgress sx={{ display: "block", margin: "auto" }} />
            ) : (
              <List>
                {filteredFeedback
                  .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                  .map((item) => (
                    <ListItem key={item.id} sx={{ marginBottom: 2 }}>
                      <Card sx={{ width: "100%", borderRadius: 2, boxShadow: 2, ":hover": { boxShadow: 6 } }}>
                        <CardContent>
                          <ListItemText
                            primary={<Typography variant="h6">{`${item.category}: ${item.description}`}</Typography>}
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                {`Status: ${item.status} | Submitted on: ${new Date(item.date).toLocaleString()}`}
                              </Typography>
                            }
                          />
                          {item.image && (
                            <Avatar
                              src={`http://localhost:5000${item.image}`}
                              sx={{ width: 80, height: 80, marginTop: 1, borderRadius: 0 }} // Square shape
                            />
                          )}
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
              </List>
            )}

            <Pagination
              count={Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE)}
              page={page}
              onChange={handlePageChange}
              sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
