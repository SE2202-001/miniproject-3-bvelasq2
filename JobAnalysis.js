// Class representing a job and its properties
class Job {
  constructor(jobNo, title, link, postedTime, type, level, estimatedTime, skill, detail) {
    this.jobNo = jobNo;               // Unique identifier for the job
    this.title = title;               // Title of the job
    this.link = link;                 // Link to the job posting
    this.postedTime = postedTime;     // Time the job was posted (as a string)
    this.type = type;                 // Type of the job (e.g., "Full-time", "Part-time")
    this.level = level;               // Level of the job (e.g., "Entry", "Intermediate", "Expert")
    this.estimatedTime = estimatedTime; // Estimated time to complete the job
    this.skill = skill;               // Skills required for the job
    this.detail = detail;             // Additional details about the job
  }

  // Method to return a formatted string with job details for display
  getDetails() {
    return `
      <h3>${this.title}</h3>
      <p><strong>Posted:</strong> ${this.getFormattedPostedTime()}</p>
      <p><strong>Type:</strong> ${this.type}</p>
      <p><strong>Level:</strong> ${this.level}</p>
      <p><strong>Estimated Time:</strong> ${this.estimatedTime}</p>
      <p><strong>Skill:</strong> ${this.skill}</p>
      <p><strong>Detail:</strong> ${this.detail}</p>
      <p><a href="${this.link}" target="_blank">View Job</a></p>
    `;
  }

  // Method to format the 'postedTime' property to a human-readable format
  getFormattedPostedTime() {
    const [value, unit] = this.postedTime.split(' '); // Split the postedTime into value and unit (e.g., "2 hours")
    const timeValue = parseInt(value); // Convert value to an integer

    if (unit.includes('minute')) {
      return `${timeValue} minute${timeValue > 1 ? 's' : ''} ago`;
    } else if (unit.includes('hour')) {
      return `${timeValue} hour${timeValue > 1 ? 's' : ''} ago`;
    } else if (unit.includes('day')) {
      return `${timeValue} day${timeValue > 1 ? 's' : ''} ago`;
    } else {
      return this.postedTime; // Return as is if it doesn't match the expected format
    }
  }

  // Static method to parse posted time into a numerical value (in minutes)
  static parsePostedTime(postedTime) {
    const [value, unit] = postedTime.split(' ');
    const multiplier = unit.includes('minute') ? 1 : unit.includes('hour') ? 60 : 1440; // Conversion factors for minutes, hours, or days
    return parseInt(value) * multiplier;
  }

  // Static method to sort jobs by title (ascending or descending)
  static sortByTitle(jobs, ascending = true) {
    return jobs.sort((a, b) =>
      ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }

  // Static method to sort jobs by posted time (oldest or newest first)
  static sortByPostedTime(jobs, oldestFirst = true) {
    return jobs.sort((a, b) =>
      oldestFirst
        ? Job.parsePostedTime(a.postedTime) - Job.parsePostedTime(b.postedTime)
        : Job.parsePostedTime(b.postedTime) - Job.parsePostedTime(a.postedTime)
    );
  }
}

// Array to hold all the job objects
let jobs = [];
// Variable to hold filtered jobs
let filteredJobs = [];

// Event listener for the "Load Data" button to load and parse the JSON file
document.getElementById('loadData').addEventListener('click', () => {
  const fileInput = document.getElementById('upload');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse the JSON data and create Job objects
        const data = JSON.parse(e.target.result);
        jobs = data.map(job => new Job(
          job["Job No"],
          job["Title"],
          job["Job Page Link"],
          job["Posted"],
          job["Type"],
          job["Level"],
          job["Estimated Time"],
          job["Skill"],
          job["Detail"]
        ));
        displayJobs(jobs); // Display all jobs
        populateFilters(jobs); // Populate filter dropdowns based on the job data
      } catch (error) {
        alert("Invalid JSON format"); // Handle JSON parsing errors
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please upload a JSON file"); // Handle case when no file is uploaded
  }
});

// Function to display job listings on the webpage
function displayJobs(jobs) {
  const list = document.getElementById('list');
  list.innerHTML = jobs.map(job => `
    <div class="job">
      <h3>${job.title}</h3>
      <p>Posted: ${job.getFormattedPostedTime()}</p>
      <p>Type: ${job.type}</p>
      <p>Level: ${job.level}</p>
      <button onclick="toggleDetails('${job.jobNo}')">View Details</button>
      <div class="job-details" id="details-${job.jobNo}" style="display: none;">
        ${job.getDetails()}
      </div>
    </div>
  `).join(''); // Use map to create job listings and join to convert array to a string
}

// Function to toggle the visibility of job details
function toggleDetails(jobNo) {
  const detailsDiv = document.getElementById(`details-${jobNo}`);
  const isVisible = detailsDiv.style.display === 'block';
  detailsDiv.style.display = isVisible ? 'none' : 'block'; // Show/hide the details
}

// Function to populate filter dropdowns with unique job levels, types, and skills
function populateFilters(jobs) {
  const levels = [...new Set(jobs.map(job => job.level))];
  const types = [...new Set(jobs.map(job => job.type))];
  const skills = [...new Set(jobs.map(job => job.skill))];

  populateDropdown('levelFilter', levels);
  populateDropdown('typeFilter', types);
  populateDropdown('skillFilter', skills);
}

// Function to populate a dropdown with options
function populateDropdown(id, options) {
  const dropdown = document.getElementById(id);
  dropdown.innerHTML = '<option value="">All</option>' + options.map(option => `
    <option value="${option}">${option}</option>
  `).join(''); // Add "All" option and map each value to an <option> element
}

// Event listeners for filter dropdowns to call the filterJobs function on change
document.getElementById('levelFilter').addEventListener('change', filterJobs);
document.getElementById('typeFilter').addEventListener('change', filterJobs);
document.getElementById('skillFilter').addEventListener('change', filterJobs);

// Function to filter jobs based on selected filter criteria
function filterJobs() {
  const level = document.getElementById('levelFilter').value;
  const type = document.getElementById('typeFilter').value;
  const skill = document.getElementById('skillFilter').value;

  // Filter jobs based on selected criteria
  filteredJobs = jobs.filter(job => 
    (!level || job.level === level) &&
    (!type || job.type === type) &&
    (!skill || job.skill === skill)
  );
  displayJobs(filteredJobs); // Display filtered jobs
}

// Event listener for the "Sort" button to sort and display jobs based on the selected sorting option
document.getElementById('sortButton').addEventListener('click', () => {
  const sortDropdown = document.getElementById('sortDropdown');
  const sortOption = sortDropdown.value;

  if (sortOption) {
    let sortedJobs;
    // Sort only the filtered jobs
    if (sortOption === 'titleAsc') {
      sortedJobs = Job.sortByTitle([...filteredJobs], true);
    } else if (sortOption === 'titleDesc') {
      sortedJobs = Job.sortByTitle([...filteredJobs], false);
    } else if (sortOption === 'postedNew') {
      sortedJobs = Job.sortByPostedTime([...filteredJobs], true);
    } else if (sortOption === 'postedOld') {
      sortedJobs = Job.sortByPostedTime([...filteredJobs], false);
    }
    displayJobs(sortedJobs); // Display the sorted jobs
  } else {
    alert("Please select a sort option."); // Alert if no sort option is selected
  }
});
