window.BREVO_CONFIG = {
  forms: {
    newsletter: {
      formActionUrl: "https://3a63b53b.sibforms.com/serve/MUIFAHk5FiOTahhsv8ze2CDiOlE8pI1Wd9J29O1eWxvqc2vkKwM7Wse0nysLbPaJUG1sp3zN6V9CbvVH3FHlOIcOnAVjZPm1Byyvu_lbdR_nTQqySKxp9gVSdIcNmYj5A4p9RVZ9ajs0kzjMVrBu-rbYOO7kaazuR4ugymBnmibgvwNoARhMTFjvErVN22kN7S-bulOH-gJ7uuiWTA==",
      successMessage: "Thanks for subscribing. Please check your inbox.",
      errorMessage: "Subscription failed. Please try again.",
      debugErrors: true,
      fields: {
        email: "EMAIL"
      },
      extraFields: {
        email_address_check: "",
        locale: "en"
      }
    },
    studioInquiry: {
      // TODO: Replace with the dedicated studio inquiry form URL from Brevo.
      // The newsletter URL below does not accept studio-specific fields (FULLNAME,
      // RENTAL_TYPE, MESSAGE).  Create a new Brevo embedded form with those fields,
      // then paste its unique URL here.
      formActionUrl: "",
      successMessage: "Thanks. Your booking request was sent.",
      errorMessage: "Our booking form is temporarily unavailable. Please email us at kenchahouse@gmail.com.",
      debugErrors: true,
      fields: {
        name: "FULLNAME",
        email: "EMAIL",
        rentalType: "RENTAL_TYPE",
        message: "MESSAGE"
      },
      extraFields: {}
    },
    partyInquiry: {
      // TODO: Replace with the dedicated party inquiry form URL from Brevo.
      // All three forms were sharing the newsletter URL, which only accepts the
      // EMAIL field.  Brevo rejects submissions that include unknown fields
      // (FIRSTNAME, LASTNAME, SMS, MESSAGE), so no contact data was being saved.
      // Fix: go to the Brevo dashboard → Forms, create a new embedded form with
      // the fields FIRSTNAME, LASTNAME, EMAIL, SMS, and MESSAGE, then paste the
      // new form's URL here.
      formActionUrl: "",
      successMessage: "Thanks. Your party inquiry was sent.",
      errorMessage: "Our party inquiry form is temporarily unavailable. Please email us at kenchahouse@gmail.com.",
      debugErrors: true,
      fields: {
        firstName: "FIRSTNAME",
        lastName: "LASTNAME",
        email: "EMAIL",
        phone: "SMS",
        message: "MESSAGE"
      },
      extraFields: {
        email_address_check: "",
        locale: "en"
      }
    }
  }
};
