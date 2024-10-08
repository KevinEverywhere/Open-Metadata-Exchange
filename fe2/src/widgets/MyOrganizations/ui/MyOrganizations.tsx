import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Radio, RadioGroup, FormControlLabel, FormControl, Grid, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import cls from './MyOrganizations.module.scss';

export function MyOrganizations() {
  const [csrfToken, setCsrfToken] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [defaultOrganizationId, setDefaultOrganizationId] = useState(NaN);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get('/api/csrf-token/')
      .then(response => {
        setCsrfToken(response.data.token);
        return axios.get('/api/users/v1/profile/default-organization/');
      })
      .then(response => {
        if (!response.data) return;
        const orgs = response.data;
        const defaultOrgs = orgs.find(org => org.is_default);
        setOrganizations(orgs);
        setDefaultOrganizationId(Number(defaultOrgs?.id));
      })
      .catch(error => {
        console.error('Error fetching user data or CSRF token:', error);
      });
  }, []);

  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  const handleChange = (event) => {
    const newDefaultOrganizationId = Number(event.target.value);
    setDefaultOrganizationId(newDefaultOrganizationId);
    setCookie('default_organization_id', newDefaultOrganizationId, 30);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.post('/api/users/v1/profile/default-organization/', { default_organization_id: defaultOrganizationId }, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      }
    })
    .then(response => {
      setSuccessMessage(response.data.message || 'Your default organization has been updated.');
      setErrorMessage('');
    })
    .catch(error => {
      const errorMsg = error.response?.data?.message || 'An error occurred while updating your profile.';
      setErrorMessage(errorMsg);
      setSuccessMessage('');
    });
  };

  return (
    <div className={cls["parent-container"]}>
      <div className={`container-fluid page-description js-page-description ${cls["page-description"]}`}>
        <div className={`container ${cls["page-description-title-container"]}`}>
          <h1 className={cls["page-description-title"]}>My Account</h1>
        </div>
      </div>
      <div className={cls["container"]}>
        <div className="row">
          <div className="col-md-4">
            <nav className={cls["sidebar-navigation"]}>
              <ul>
                <li>
                  <Link to="/new/my/account">Account Settings</Link>
                </li>
                <hr />
                <li>
                  <i className="fa fa-chevron-right"></i>
                  <Link to="/new/my/default-organization/" className={cls["active"]}>Organizations</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="col-md-8">
            <div className={cls["message-text"]}>
              {successMessage && <Alert severity="success">{successMessage}</Alert>}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </div>
            <div>
              <h1 className={cls["page-title"]}>Select your default organization</h1>
              <p className={cls["page-subtitle"]}>Your default organization will be displayed each time you log in.</p>
            </div>
            <Container maxWidth="md">
              <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" className={cls["form-control"]}>
                  <RadioGroup
                    aria-label="organization"
                    name="organization"
                    value={defaultOrganizationId}
                    onChange={handleChange}
                  >
                    {organizations.map((org) => (
                      <FormControlLabel
                        key={org.id}
                        value={org.id}
                        checked={defaultOrganizationId === Number(org.id)}
                        control={<Radio />}
                        label={org.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Grid item xs={12}>
                  <Button className="btn btn-primary" type="submit" variant="contained" color="primary">
                    Save Changes
                  </Button>
                  <Button href="/new/my/default-organization/" variant="text">
                    Cancel
                  </Button>
                </Grid>
              </form>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}
