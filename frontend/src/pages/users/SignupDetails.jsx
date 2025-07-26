// src/pages/SignupDetails.jsx
import React, { use } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css'; // optional for custom styles
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
// Removed legacy SignupDetails page. Signup is now handled via modal/auth form.
import { useNavigate } from 'react-router-dom';
