// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, 'Please add a name'],
//         },
//         email: {
//             type: String,
//             required: [true, 'Please add an email'],
//             unique: true,
//             match: [
//                 /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//                 'Please add a valid email',
//             ],
//         },
//         password: {
//             type: String,
//             required: [true, 'Please add a password'],
//             minlength: 6,
//             select: false, 
//         },
//         role: {
//             type: String,
//             enum: ['restaurant', 'individual', 'organization','admin'],
//             default: 'individual',
//         },
//             location: {
//         type: {
//             type: String,
//             enum: ["Point"],
//             default: "Point"
//         },
//         coordinates: {
//             type: [Number] ,// [lng, lat]
//             default: undefined
//         }
//     },
//         isApproved: {
//             type: Boolean,
//             default: function () {
//                 // Automatically approve individuals. Require admin approval for others.
//                 return this.role === 'individual';
//             },
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// userSchema.pre('save', async function () {
//     if (!this.isModified('password')) return;

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });
// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// userSchema.index({ location: "2dsphere" });

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt        = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['restaurant', 'individual', 'organization', 'admin'],
      default: 'individual',
    },

    // ── Common fields ──────────────────────────────────
    phone: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },

    // ── NGO / Organization fields ──────────────────────
    ngoName: {
      type: String,
      default: null,
    },
    registrationNo: {
      type: String,
      default: null,
    },

    // ── Restaurant fields ──────────────────────────────
    restaurantName: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },

    // ── Location (GeoJSON) ─────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    // ── Approval (NGOs & restaurants need admin approval) ──
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === 'individual';
      },
    },
  },
  {
    timestamps: true,
  }
);

// ── Hash password before save ──────────────────────────────
// ✅ FIX: saltRounds lowered from 10 → 8 on slow/free-tier servers.
// bcrypt(10) can take 10–15s cold; bcrypt(8) takes ~2s — still secure.
// Change back to 10 if running on a proper server.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(8); // ← was 10
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);