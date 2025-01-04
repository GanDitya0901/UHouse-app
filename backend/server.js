const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors'); 
const path = require('path');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const fs = require ('fs');
const multer = require('multer');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'uhousbali@gmail.com',
    pass: 'iwxr biuk axlo zoga' // Use the App Password if 2FA is enabled
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Generate a unique filename for each uploaded file
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//connection to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/user')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


//User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  password: { type: String },
  role: {
    type: String,
    enum: ['admin', 'guest'],
    default: 'guest'
  },
  date: { type: Date, default: Date.now },
  language: { type: String },
  country: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  fullname: { type: String },
  profilePhoto: { type: String }, // URL or path to the profile photo

  // Add resetPasswordToken and resetPasswordExpires fields
  resetPasswordToken: { type: String, required: false }, // Token for password reset
  resetPasswordExpires: { type: Date, required: false } // Expiration time for the token

});

 //additional request schema
// const guestRequestSchema = new mongoose.Schema({
//   guestName: { type: String, required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User schema
//   requestDate: { type: Date, default: Date.now },
// });


// const GuestRequestSchema = new mongoose.Schema({
//   username: { type: String, required: true },  // Username is required for tracking
  
//   // requestType: { type: String, enum: [
//   //     "earlyCheckIn", "lateCheckIn", "lateCheckout", 
//   //     "extraBed", "earlyBreakfast", "addAmenities", 
//   //     "specialRequests", ""
//   // ]},
  
//   // Extra Bed details subdocument
//   extraBedDetails: {
//     adults: { type: Number, min: 0, required: false },
//     children: { type: Number, min: 0, required: false },
//     bedType: { type: String, enum: ["single", "double"], required: false, default: null },
//     instructions: { type: String, required: false },
//     status: { type: String, default: "pending" }
//   },

//   // Early Check-In details subdocument
//   earlyCheckInDetails: {
//       time: { type: String }, // Preferred time as a string (e.g., "08:30")
//       instructions: { type: String },
//       status: { type: String, default: "pending" }
//   },

//   // Late Check-In details subdocument
//   lateCheckInDetails: {
//       time: { type: String },
//       instructions: { type: String },
//       status: { type: String, default: "pending" }
//   },

//   // Late Check-Out details subdocument
//   lateCheckOutDetails: {
//       time: { type: String },
//       instructions: { type: String },
//       status: { type: String, default: "pending" }
//   },

//   // Early Breakfast details subdocument
//   earlyBreakfastDetails: {
//       menuItems: { type: String },  // List of breakfast items
//       time: { type: String },
//       status: { type: String, default: "pending" }
//   },

//   // Add Amenities details subdocument
//   amenities: {
//       extraTowels: { type: Boolean, default: false },
//       toiletries: { type: Boolean, default: false },
//       coffeeTea: { type: Boolean, default: false },
//       extraPillows: { type: Boolean, default: false },
//       extraBlanket: { type: Boolean, default: false },
//       crib: { type: Boolean, default: false },
//       ironBoard: { type: Boolean, default: false },
//       status: { type: String, default: "pending" }
//   },

//   // Special Services (Airport Pickup) details
//   airportPickupDetails: {
//       flightNumber: { type: String },
//       arrivalTime: { type: String },
//       specialInstructions: { type: String },
//   },

//   specialServices: {
//     type: [{
//       service: { type: String, enum: ["airportPickup", "spaPackage", "romanticSetup", "birthdaySurprise"] },
//       status: { type: String, default: "pending" }  // Added status with default "pending"
//     }],
//     default: []  // Default to an empty array if no services are provided
//   },
//   specialRequests: {
//     description: { type: String, required: false },  // Description for special requests
//     status: { type: String, default: "pending" }  // Added status with default "pending"
//   },
//   requestDetails: { type: String }  // General additional details for any request
// });


const GuestRequestSchema = new mongoose.Schema({
  username: { type: String, required: true },  // Username is required for tracking
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Extra Bed details subdocument
  extraBedDetails: {
    adults: { type: Number, min: 0, required: false },
    children: { type: Number, min: 0, required: false },
    bedType: { type: String, enum: ["single", "double"], required: false },
    instructions: { type: String, required: false },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }
  },

  // Early Check-In details subdocument
  earlyCheckInDetails: {
    time: { type: String }, // Preferred time as a string (e.g., "08:30")
    instructions: { type: String },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  // Late Check-In details subdocument
  lateCheckInDetails: {
    time: { type: String },
    instructions: { type: String },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  // Late Check-Out details subdocument
  lateCheckOutDetails: {
    time: { type: String },
    instructions: { type: String },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String } , // Added approve message
    lastUpdated: { type: Date }

  },

  // Early Breakfast details subdocument
  earlyBreakfastDetails: {
    menuItems: { type: String },  // List of breakfast items
    time: { type: String },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  // Add Amenities details subdocument
  amenities: {
    extraTowels: { type: Boolean },
    toiletries: { type: Boolean },
    coffeeTea: { type: Boolean },
    extraPillows: { type: Boolean },
    extraBlanket: { type: Boolean },
    crib: { type: Boolean },
    ironBoard: { type: Boolean },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  // Special Services (Airport Pickup) details
  airportPickupDetails: {
    flightNumber: { type: String },
    arrivalTime: { type: String },
    specialInstructions: { type: String },
  },

  specialServices: {
    service: { type: String, enum: ["airportPickup", "spaPackage", "romanticSetup", "birthdaySurprise"], required: false },
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  // Special Requests details
  specialRequests: {
    description: { type: String, required: false },  // Description for special requests
    status: { type: String },
    declineReason: { type: String },
    approveMessage: { type: String },  // Added approve message
    lastUpdated: { type: Date }

  },

  requestDetails: { type: String }  // General additional details for any request
}, { timestamps: true });


// Model export
module.exports = mongoose.model('GuestRequest', GuestRequestSchema);
const GuestRequest = mongoose.model('GuestRequest', GuestRequestSchema);

// API route to save guest request data
// API route to save guest request data
// API route to save guest request data
app.post('/api/guest-request', async (req, res) => {
  try {
    const requestBody = req.body;

    // Helper function to set status to 'pending' if the detail has at least one property
    // Helper function to set status to 'pending' and lastUpdated to current date if the detail is filled
    const setPendingIfFilled = (detail) => {
      if (detail && typeof detail === 'object' && Object.keys(detail).length > 0) {
        if (!detail.status) {
          detail.status = 'pending';
        }
        detail.lastUpdated = Date.now(); // Set the lastUpdated timestamp
      }
    };
    // Apply the check to each relevant field
    setPendingIfFilled(requestBody.specialRequests);
    setPendingIfFilled(requestBody.extraBedDetails);
    setPendingIfFilled(requestBody.amenities);
    setPendingIfFilled(requestBody.earlyBreakfastDetails);
    setPendingIfFilled(requestBody.earlyCheckInDetails);
    setPendingIfFilled(requestBody.lateCheckInDetails);
    setPendingIfFilled(requestBody.lateCheckOutDetails);
    setPendingIfFilled(requestBody.specialServices);

    const guestRequestData = {
      ...requestBody,
      userId: requestBody.userId
    };

    const guestRequest = new GuestRequest(guestRequestData);

    
    // Save the guest request to the database
    await guestRequest.save();
    res.status(201).json({ message: 'Guest request saved successfully' });
  } catch (error) {
    console.error('Error saving guest request:', error);
    res.status(500).json({ message: 'Error saving guest request', error });
  }
});



// Route to fetch all guest requests and exclude old subdocuments
app.get('/guest-requests', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch and update requests by removing outdated subdocuments
    const guestRequests = await GuestRequest.find().lean();

    // Iterate over each request to filter out outdated subdocuments
    guestRequests.forEach((request) => {
      ['extraBedDetails', 'earlyCheckInDetails', 'lateCheckInDetails', 'lateCheckOutDetails', 'earlyBreakfastDetails', 'amenities', 'specialServices', 'specialRequests'].forEach((field) => {
        if (
          request[field] &&
          request[field].status &&
          ['approved', 'declined'].includes(request[field].status) &&
          new Date(request[field].lastUpdated) <= oneWeekAgo
        ) {
          delete request[field]; // Remove the outdated subdocument
        }
      });
    });

    res.json(guestRequests);
  } catch (error) {
    console.error('Error fetching guest requests:', error);
    res.status(500).json({ message: 'Error fetching guest requests', error });
  }
});


// Update request status
app.put('/requests/update/:id', async (req, res) => {
  console.log(`Updating request with ID: ${req.params.id}`);
  console.log('Request Body:', req.body);
  try {
    const { id } = req.params;
    const { requestType, status, declineReason, approveMessage } = req.body;

    // Set up the fields to be updated
    const updateData = {
      [`${requestType}.status`]: status,
      [`${requestType}.lastUpdated`]: Date.now(), // Update lastUpdated to the current date and time
    };

    if (status === 'declined' && declineReason) {
      updateData[`${requestType}.declineReason`] = declineReason;
    }
    if (status === 'approved' && approveMessage) {
      updateData[`${requestType}.approveMessage`] = approveMessage;
    }

    // Update the document
    const updatedRequest = await GuestRequest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Fetch the user's email based on userId from the guest request
    const userId = updatedRequest.userId;
    const user = await User.findById(userId);

    if (!user || !user.email) {
      return res.status(404).json({ message: 'User not found or email not available' });
    }

    // Prepare email content based on status
    let subject = '';
    let text = '';

    if (status === 'approved') {
      subject = 'Your Request Has Been Approved';
      text = `Dear ${user.fullname || 'Guest'},\n\nYour request for ${requestType} has been approved.\n${approveMessage || ''}\n\nBest regards,\nUhouse Bali Team`;
    } else if (status === 'declined') {
      subject = 'Your Request Has Been Declined';
      text = `Dear ${user.fullname || 'Guest'},\n\nWe regret to inform you that your request for ${requestType} has been declined.\nReason: ${declineReason || 'No reason provided.'}\n\nBest regards,\nUhouse Bali Team`;
    }

    // Send the email notification
    const mailOptions = {
      from: 'uhousbali@gmail.com',
      to: user.email,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent successfully');
      res.json({ message: 'Request updated and email sent successfully', updatedRequest });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Facility Schema
const facilitySchema = new mongoose.Schema({
  parking: Boolean,
  swimmingPool: Boolean,
  airConditioner: Boolean,
  balcony: Boolean,
  towel: Boolean,
  bathAmenities: Boolean,
  sunBed: Boolean,
  outdoorShower: Boolean
});

// Schema for RoomManage
const RoomManageSchema = new mongoose.Schema({
  roomImg: String,
  roomType: String,
  roomNum: Number,
  roomPolicy: String,
  roomDesc: String,
  roomBathroom: String,
  roomFloor: Number,
  bedType: String,
  numBeds: Number,
  roomPrice: Number,
  facilitySchema: facilitySchema,
});



//manage room availability

const RoomAvailabilitySchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  date: { type: Date, required: true },
  roomsToSell: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['closed', 'bookable', 'sold-out'], 
    default: 'closed' 
  },
  netBooked: { type: Number, default: 0 },
  standardRate: { type: Number, default: 0 }, // Ensure default to 0

});

const RoomAvailability = mongoose.model('RoomAvailability', RoomAvailabilitySchema);

// 1. **Fetch Room Availability**:
app.get('/availability', async (req, res) => {
  const { roomType, startDate, endDate } = req.query;

  try {
    // Build the filter for room availability
    const filter = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (roomType !== 'all') {
      filter.roomType = roomType;
    }

    // Fetch room availability
    const availability = await RoomAvailability.find(filter).lean();

    // Fetch reservations within the specified date range
    const reservations = await Reservation.find({
      roomType: roomType !== 'all' ? roomType : { $exists: true },
      checkInDate: { $lte: new Date(endDate) },
      checkOutDate: { $gte: new Date(startDate) },
      status: 'confirmed',
    });

    // Group reservations by roomType and date
    const reservationCounts = reservations.reduce((counts, reservation) => {
      const checkInDate = new Date(reservation.checkInDate);
      const checkOutDate = new Date(reservation.checkOutDate);

      for (
        let date = new Date(checkInDate);
        date <= checkOutDate;
        date.setDate(date.getDate() + 1)
      ) {
        const key = `${reservation.roomType}-${date.toISOString().split('T')[0]}`;
        counts[key] = (counts[key] || 0) + 1;
      }

      return counts;
    }, {});

    // Update availability with `netBooked`, adjust `roomsToSell`, and format `standardRate`
    const updatedAvailability = availability.map((entry) => {
      const key = `${entry.roomType}-${entry.date.toISOString().split('T')[0]}`;
      const netBooked = reservationCounts[key] || 0;

      // Calculate updated rooms to sell and status
      const adjustedRoomsToSell = Math.max(entry.roomsToSell - netBooked, 0);
      const status = adjustedRoomsToSell === 0 ? 'sold-out' : entry.status;

      return {
        ...entry,
        netBooked,
        roomsToSell: adjustedRoomsToSell,
        status,
        standardRate: entry.standardRate || 0, // Ensure standardRate is included as a number
        formattedStandardRate: `IDR ${entry.standardRate || 0}`, // Add formatted standard rate
      };
    });

    res.status(200).json(updatedAvailability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Error fetching availability', error });
  }
});



// 2. **Initialize Room Availability with Default Status**:
app.post('/availability/init', async (req, res) => {
  const { roomType, dates } = req.body;

  try {
    const initialData = dates.map((date) => ({
      roomType,
      date: new Date(date),
      status: 'closed',
      roomsToSell: 0,
    }));
    await RoomAvailability.insertMany(initialData);
    res.status(201).json({ message: 'Room availability initialized', data: initialData });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing availability', error });
  }
});


// 3. **Update Room Status or Rooms to Sell**:
app.post('/availability/update', async (req, res) => {
  const { roomType, date, status, roomsToSell } = req.body;

  try {
    const updatedAvailability = await RoomAvailability.findOneAndUpdate(
      { roomType, date: new Date(date) },
      { status, roomsToSell }, // Update status and rooms to sell
      { new: true, upsert: true } // Create if not exists
    );
    res.status(200).json(updatedAvailability);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room availability', error });
  }
});

app.put('/availability/update', async (req, res) => {
  const { roomType, date, status, roomsToSell, standardRate } = req.body;

  console.log('Incoming payload:', req.body); // Debug log

  try {
    const updatedAvailability = await RoomAvailability.findOneAndUpdate(
      { roomType, date: new Date(date) },
      { status, roomsToSell, standardRate }, // Ensure standardRate is updated
      { new: true, upsert: true }
    );

    console.log('Document updated in database:', updatedAvailability); // Log result
    res.status(200).json(updatedAvailability);
  } catch (error) {
    console.error('Error updating room availability:', error);
    res.status(500).json({ message: 'Error updating room availability', error });
  }
});

// API Endpoint for Calculating Total Price
app.post('/calculate-total', async (req, res) => {
  const { roomType, checkInDate, checkOutDate } = req.body;

  if (!roomType || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    // Ensure valid date range
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date.' });
    }

    // Exclude check-out day from the calculation
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);

    // Fetch rates for the specified date range and room type
    const rates = await RoomAvailability.find({
      roomType,
      date: { $gte: startDate, $lte: adjustedEndDate },
    });

    // Default room price for missing dates based on roomType
    const roomData = await RoomManage.findOne({ roomType });
    if (!roomData) {
      return res.status(404).json({ error: 'Room type not found.' });
    }
    const defaultRate = roomData.roomPrice;

    // Generate a map of rates by date
    const rateMap = rates.reduce((map, rate) => {
      map[rate.date.toISOString().split('T')[0]] = rate.standardRate;
      return map;
    }, {});

    // Generate all dates in the range (excluding check-out day)
    const allDates = [];
    for (let d = new Date(startDate); d <= adjustedEndDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split('T')[0]);
    }

    // Calculate total, filling in missing dates with the default rate
    let total = allDates.reduce((sum, date) => {
      return sum + (rateMap[date] || defaultRate);
    }, 0);

    // Apply 5% discount for 7 nights or more
    if (allDates.length >= 7) {
      total -= total * 0.05;
      console.log(`Discount applied for ${allDates.length} nights. Total after discount: ${total}`);
    }

    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



//end manage room availability

// Reservation Schema 
const ReservationSchema = new mongoose.Schema({ 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentMethod: {
    type: String,
    enum: ['On-site', 'online'],
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, required: true },
  roomType: { type: String, required: true },
  roomDesc: { type: String, required: true },
  total: { type: Number, required: true },
 // paymentMethod: { type: String, required: true, enum: ['On-site', 'online'] }, 
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' }
}, { timestamps: true });
  /*paymentStatus: {
    type: String, 
    enum: ["pending", "paid"], 
    default: "pending",
  }, 
  status: {
    type: String, 
    enum: ["pending", "confirmed", "canceled"], 
    default: "pending",
  }, */
  /*paymentStatus: {
    type: String, 
    enum: ["pending", "paid"], 
    default: "pending",
  }, 
  status: {
    type: String, 
    enum: ["pending", "confirmer", "cancelled"], 
    default: "pending",
  }, */


// Review and Rating Schema
// Define the schema for reviews and ratings
// Define the schema for reviews and ratings
const ReviewRatingSchema = new mongoose.Schema({
  reservationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reservation', 
    required: true,
    unique: true // Ensure one review per reservation
  },
  reviewerName: { type: String, required: true },
  reviewTitle: { type: String, required: true },
  reviewText: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now }
});


// Define Mongoose Model 
const RoomManage = mongoose.model('RoomManage', RoomManageSchema);
const User = mongoose.model('User', UserSchema);
const Reservation = mongoose.model("Reservation", ReservationSchema);
const ReviewRating = mongoose.model('ReviewRating', ReviewRatingSchema);

// JWT Secret Key
const JWT_SECRET = 'jwtToken'; 

//for admin default credential
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({
        username: 'admin',
        email: adminEmail,
        phone: '0000000000',
        password: hashedPassword,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Default admin created');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

createDefaultAdmin();


//signUp
app.post('/signup', (req, res) => {
  const { username, email, phone, password } = req.body;
  console.log('Received user data:', req.body);

  User.findOne({ email })
    .then(user => {
      if (user) {
        return res.status(400).json({ message: 'This email is already registered' });
      } else {
        const newUser = new User({
          username,
          email,
          phone,
          password,
          role: 'guest'
        });

        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to generate salt' });
          }
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json({ message: 'Failed to hash password' });
            }
            newUser.password = hash;
            console.log('Saving user data:', newUser);
            newUser
              .save()
              .then(savedUser => {
                console.log('User saved successfully:', savedUser);
                const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET);
                console.log('JWT token:', token); // Log the token
                res.json({ user: savedUser, token });
              })
              .catch(err => {
                console.log('Error saving user:', err);
                return res.status(500).json({ message: 'Failed to save user' });
              });
          });
        });
      }
    })
    .catch(err => {
      console.log('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        console.error('No user with that email address');
        return res.status(404).json({ message: 'No user with that email address' });
      }

      // Generate the token and expiration time
      const token = crypto.randomBytes(20).toString('hex');
      const expirationTime = Date.now() + 3600000; // 1 hour

      // Log the token and expiration time for debugging purposes
      console.log('Generated token:', token);
      console.log('Token will expire at:', new Date(expirationTime).toISOString());

      // Set the token and expiration time on the user object
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expirationTime;

      user.save().then(updatedUser => {
        console.log('Token saved for user:', updatedUser.email);
        console.log('Token saved for user:', updatedUser.resetPasswordToken);
        console.log('Token expiration saved:', new Date(updatedUser.resetPasswordExpires));
        
        const mailOptions = {
          to: user.email,
          from: 'password-reset@yourapp.com',
          subject: 'Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                 Please click on the following link, or paste this into your browser to complete the process:\n\n
                 http://localhost:4200/reset-password/${token}\n\n
                 If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send the email with the reset token
        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({ message: 'Error sending email' });
          }
          res.json({ message: 'Password reset email sent' });
        });
      }).catch(err => {
        console.error('Error saving user:', err);
        res.status(500).json({ message: 'Error saving user' });
      });
    })
    .catch(err => {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error' });
    });
});



app.post('/reset-password/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const newPassword = req.body.password;

        // Log the token from the URL
        console.log('Token in URL:', token);
        

    // Check if the token exists and is not expired
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
    
    console.log('User query result:', user);
    if (user) {
      console.log('Token in database:', user.resetPasswordToken);
    } else {
      console.error('Token or user not found. Token used for query:', token);
    }
    

    // Log the result of the user query
console.log('User query result:', user);


    if (!user) {
      console.error('Invalid or expired token:', token);
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

        // Log the token stored in the database


    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user and save
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


//signIn
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: 'User not found' });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to compare passwords' });
        }
        if (!result) {
          return res.status(401).json({ password: 'Incorrect password' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token:', token);

        let redirectUrl = '/manage-profile';
        if (user.role === 'admin') {
          redirectUrl = '/crudRoom';
        }

        res.json({ message: 'Login successful', role: user.role, token, redirectUrl });
      });
    })
    .catch(err => {
      console.log('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    });
});


// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).send('Token is required');

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.user = decoded;
    next();
  });
};

//users role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireGuest = (req, res, next) => {
  if (req.user.role !== 'guest') {
    return res.status(403).json({ message: 'Guest access required' });
  }
  next();
};

app.get('/admin', verifyToken, requireAdmin, (req, res) => {
  res.send('Welcome to the admin page');
});

app.get('/guest', verifyToken, requireGuest, (req, res) => {
  res.send('Welcome to the guest page');
});


//additional request post
app.post('/api/guest-requests', async (req, res) => {
  try {
      const { guestName, userId } = req.body; // Expect userId to be sent from the client
      const newRequest = new GuestRequest({
          guestName,
          user: userId, // Save the reference to the user
      });
      await newRequest.save();
      res.status(201).send(newRequest);
  } catch (error) {
      res.status(500).send({ message: 'Error saving guest request', error });
  }
});


//manage profile
app.post('/uploads', upload.single('profilePhoto'), (req, res) => {
  const userId = req.body.userId;

  console.log('Received file:', req.file);
console.log('Received userId:', userId);


  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const photoUrl = `uploads/${req.file.filename}`; // Adjust as needed

  User.findByIdAndUpdate(
    userId,
    { profilePhoto: photoUrl },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ profilePhoto: user.profilePhoto });
    })
    .catch((err) => {
      console.error('Error updating user profile photo:', err); // Log error to console
      res.status(500).json({ error: 'Photo upload failed' });
    });
});





app.post('/user/profile-photo', upload.single('profilePhoto'), (req, res) => {
  const profilePhotoPath = req.file.path;
  const userId = req.user.id; // Assuming req.user is set after token verification

  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.profilePhoto = profilePhotoPath;
      user.save()
        .then(updatedUser => res.json(updatedUser))
        .catch(err => res.status(500).json({ error: 'Error saving user data' }));
    })
    .catch(err => res.status(500).json({ error: 'Database error' }));
});

// Endpoint for getting user profile
app.get('/user/profile', verifyToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Error fetching user data' }));
});

// Endpoint for updating user profile
app.put('/user/profile', verifyToken, upload.single('profilePhoto'), (req, res) => {
  const { fullname, username, email, phone, dateOfBirth, gender, country, language, address } = req.body;

  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (fullname !== undefined) user.fullname = fullname;
      if (username !== undefined) user.username = username;
      if (address !== undefined) user.address = address;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (gender !== undefined) user.gender = gender;
      if (country !== undefined) user.country = country;
      if (language !== undefined) user.language = language;
      if (req.file) user.profilePhoto = `/uploads/${req.file.filename}`;

      user.save()
        .then(updatedUser => res.json(updatedUser))
        .catch(err => res.status(500).json({ error: 'Error updating user data' }));
    })
    .catch(err => res.status(500).json({ error: 'Database error' }));
});


//update password
app.post('/user/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  User.findById(req.user.id).then(user => {
    if (!user) return res.status(404).json({ message: 'User not found' });

    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });
      if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).json({ error: 'Error generating salt' });

        bcrypt.hash(newPassword, salt, (err, hash) => {
          if (err) return res.status(500).json({ error: 'Error hashing new password' });

          user.password = hash;
          user.save().then(updatedUser => {
            res.json({ message: 'Password updated successfully' });
          }).catch(err => res.status(500).json({ error: 'Error saving new password' }));
        });
      });
    });
  }).catch(err => res.status(500).json({ error: 'Database error' }));
});


// Endpoint to handle file upload for room
app.post('/roommanages', upload.single('roomImg'), verifyToken, async (req, res) => {
  try {
    const { roomType, roomNum, roomPrice, roomDesc, roomBathroom, roomFloor,bedType,numBeds, facilities } = req.body;

    // Validate required fields
    if (!roomType || !roomNum || !roomPrice || !roomDesc || !roomBathroom || !roomFloor||!bedType||!numBeds) {
      console.error('Missing required fields:', { roomType, roomNum, roomPolicy, roomDesc, roomBathroom, roomFloor, bedType,numBeds });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roomNumber = Number(roomNum);
    const roomFloorNumber = Number(roomFloor);
    const roomCost = Number(roomPrice);
    const roomImage = req.file ? req.file.path : ''; 
    const newRoom = new RoomManage({
      roomImg: roomImage, 
      roomType,
      roomNum: roomNumber,
      roomPrice: roomCost,
      roomDesc,
      roomBathroom,
      roomFloor: roomFloorNumber,
      bedType,
      numBeds,
      facilities: facilities || []
    });

    console.log('newRoom', newRoom)

    await newRoom.save();
    res.status(200).json({ message: 'Room added successfully' });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch all rooms
app.get('/roommanages', verifyToken, async (req, res) => {
  try {
    const rooms = await RoomManage.find();
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/roommanages/:id', verifyToken, async (req, res) => {
  try {
    const room = await RoomManage.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/roommanages/:id', verifyToken, upload.single('roomImg'), async (req, res) => {
  try {
    const roomId = req.params.id;
    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.roomImg = req.file.path;
    }

    if (updatedData.roomNum) updatedData.roomNum = Number(updatedData.roomNum);
    if (updatedData.roomFloor) updatedData.roomFloor = Number(updatedData.roomFloor);

    const updatedRoom = await RoomManage.findByIdAndUpdate(roomId, updatedData, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/roommanages/:id', verifyToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    await RoomManage.findByIdAndDelete(roomId);
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.delete('/api/user/delete-photo', verifyToken, async (req, res) => {
  console.log('Request body:', req.body); // Expected to log: {}
  console.log('Decoded user from token:', req.user); // Logs user details from token
  
  try {
    const userId = req.user.id; // Get the user id from the decoded token
    console.log('User ID for photo deletion:', userId); // Log to confirm the ID

    // Update the user's profilePhoto field to an empty string using the user ID
    await User.updateOne({ _id: userId }, { profilePhoto: '' });

    res.status(200).json({ message: 'Profile photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ error: 'An error occurred while deleting the profile photo' });
  }
});



// Reservation Functions Start 
// Fetch all reservations 
app.get('/reservation', verifyToken, async (req, res) => {
  try {
    console.log('User Role:', req.user.role); // Debugging role
    console.log('User ID:', req.user.id); // Debugging user ID

    let reservations;
    if (req.user.role === 'admin') {
      // Fetch all reservations for admin
      reservations = await Reservation.find();
      console.log('All Reservations:', reservations); // Debug fetched reservations
    } else {
      // Fetch user-specific reservations
      reservations = await Reservation.find({ user: req.user.id });
      console.log('User Reservations:', reservations); // Debug fetched reservations
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/reservation/:_id', async (req, res) => {
  const reservationId = req.params._id; // `_id` parameter from URL
  console.log(`Received request for reservation with _id: ${reservationId}`);

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      console.log(`Reservation with _id ${reservationId} not found`);
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error retrieving reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// New reservation
app.post('/reservation', async (req, res) => {
  try {
    const { roomType, checkInDate, checkOutDate, paymentMethod } = req.body;

    console.log('Received reservation data:', req.body);

    // If payment method is "On-site", allow unauthenticated reservation
    const userId = req.user ? req.user.id : null; // Optional user ID

    // Check if roomType, checkInDate, or checkOutDate is missing
    if (!roomType || !checkInDate || !checkOutDate || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Count overlapping reservations
    const overlappingReservations = await Reservation.find({
      roomType,
      checkInDate: { $lte: new Date(checkOutDate) },
      checkOutDate: { $gte: new Date(checkInDate) },
      status: 'confirmed'
    });

    // Fetch availability records for the date range
    const availabilityRecords = await RoomAvailability.find({
      roomType,
      date: { $gte: new Date(checkInDate), $lte: new Date(checkOutDate) }
    });

    // Map availability records by date
    const availabilityMap = new Map(
      availabilityRecords.map(record => [record.date.toISOString().split('T')[0], record])
    );

    // Fetch room management data for the room type
    const roomManageData = await RoomManage.findOne({ roomType });

    if (!roomManageData) {
      return res.status(400).json({ success: false, message: 'Room type not found in RoomManage.' });
    }

    let isBookable = true;
    let warning = '';
    const missingDates = [];

    // Check each date in the range
    for (
      let currentDate = new Date(checkInDate);
      currentDate <= new Date(checkOutDate);
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const record = availabilityMap.get(dateKey);

      if (record) {
        // Check if the status is not bookable or rooms are sold out
        if (record.status !== 'bookable' || overlappingReservations.length >= record.roomsToSell) {
          isBookable = false;
          warning = 'No available rooms for one or more selected dates.';
          break;
        }
      } else {
        // Add missing date information to be inserted later
        missingDates.push({
          roomType: roomManageData.roomType,
          date: new Date(currentDate),
          roomsToSell: roomManageData.roomNum,
          status: 'bookable',
          standardRate: roomManageData.roomPrice
        });
      }
    }

    // Insert missing dates in bulk
    if (missingDates.length > 0) {
      await RoomAvailability.insertMany(missingDates);
    }

    if (!isBookable) {
      return res.status(200).json({ success: false, warning });
    }

    // Proceed with reservation creation
    const reservation = new Reservation({
      user: userId, // Allow null for Pay at Hotel reservations
      ...req.body,
      status: paymentMethod === 'On-site' ? 'pending' : 'confirmed', // Set status based on payment method
    });

    await reservation.save();

    // Respond with success
    const message =
      paymentMethod === 'On-site'
        ? 'Reservation created successfully. Please complete the payment at the hotel.'
        : 'Reservation created successfully.';

    res.status(201).json({ success: true, message, reservation });
  } catch (error) {
    console.error('Error saving reservation:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});




// Cancel reservation 
app.delete('/:id', verifyToken, async(req, res) => {
  try {
    const reservation = await ReservationSchema.findByIdAndDelete(req.params.id); 
    if (!reservation) return next ('Reservation not found'); 
    res.json({message: "Reservation cancelled"});
  }
  catch(error) {
    console.error('Error in cancellation', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// Pay reservation 
app.post('/:id/pay', verifyToken, async(req,res) => {
  try {
    const reservation = await ReservationSchema.findById(req.params.id);
    if (!reservation) return next("Reservation not found"); 

    // Payment logic

    reservation.paymentStatus = "paid"; 
    await reservation.save();
    res.json({message: "Payment successfull"});
  }
  catch(error) {
    console.error('Error in payment process', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// Update reservation status 
app.put('/:id/status', verifyToken, async(res, req) => {
  try {
    const { status } = req.body; 
    const reservation = await ReservationSchema.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!reservation) return next("Reservation not found"); 
  }
  catch(error) {
    console.error('Error in payment process', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})


// Endpoint untuk menambahkan review
app.post('/reviews/:reservationId', verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { reviewerName, reviewTitle, reviewText, rating } = req.body;

    // Ensure the reservation exists
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Create and save the review
    const newReview = new ReviewRating({
      reservationId,
      reviewerName,
      reviewTitle,
      reviewText,
      rating,
    });
    await newReview.save();

    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint untuk mendapatkan semua review berdasarkan ID reservasi
app.get('/api/reviews/:reservationId', verifyToken, async (req, res) => {
  const { reservationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res.status(400).json({ message: 'Invalid reservation ID format' });
  }

  try {
    const reviews = await ReviewRating.find({ reservationId });
    if (reviews.length === 0) {
      return res.status(200).json({ reviews: [], message: 'No reviews found for this reservation.' });
    }
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//paymeny

const midtransClient = require('midtrans-client');

// Initialize Midtrans client
const snap = new midtransClient.Snap({
  isProduction: false, // Change to 'true' for production
  serverKey: 'SB-Mid-server-ROvEC7z5VqzvfQXy8q3oqFWS',
});


// Endpoint to handle payment request
app.post('/create-transaction', async (req, res) => {
  const { orderId, amount, customerDetails } = req.body;
  console.log('payment data: ', req.body)
  // Extract the userId
  const { userId } = customerDetails;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      user_id: userId, // Pass only the userId to Midtrans
    },
    credit_card: {
      secure: true,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating transaction' });
  }
});


  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
