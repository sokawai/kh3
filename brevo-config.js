window.BREVO_CONFIG = {
  forms: {
    newsletter: {
      formActionUrl: "https://3a63b53b.sibforms.com/serve/MUIFAHk5FiOTahhsv8ze2CDiOlE8pI1Wd9J29O1eWxvqc2vkKwM7Wse0nysLbPaJUG1sp3zN6V9CbvVH3FHlOIcOnAVjZPm1Byyvu_lbdR_nTQqySKxp9gVSdIcNmYj5A4p9RVZ9ajs0kzjMVrBu-rbYOO7kaazuR4ugymBnmibgvwNoARhMTFjvErVN22kN7S-bulOH-gJ7uuiWTA==",
      successMessage: "Hooray! You're now on the Kencha House list for cozy playdates, tiny adventures, and all things giggles and cuddles!",
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
      formActionUrl: "https://3a63b53b.sibforms.com/serve/MUIFAHk5FiOTahhsv8ze2CDiOlE8pI1Wd9J29O1eWxvqc2vkKwM7Wse0nysLbPaJUG1sp3zN6V9CbvVH3FHlOIcOnAVjZPm1Byyvu_lbdR_nTQqySKxp9gVSdIcNmYj5A4p9RVZ9ajs0kzjMVrBu-rbYOO7kaazuR4ugymBnmibgvwNoARhMTFjvErVN22kN7S-bulOH-gJ7uuiWTA==",
      forceNativeSubmit: true,
      nativeSubmitInIframe: true,
      nativeIframeName: "partyInquiryBrevoTarget",
      maxMessageChars: 2000,
      successMessage: "Thank you for your inquiry. Our team will reach out to you within one business day.",
      errorMessage: "Our party inquiry form is temporarily unavailable. Please email us at kenchahouse@gmail.com.",
      debugErrors: true,
      fields: {
        firstName: "FIRSTNAME",
        lastName: "LASTNAME",
        email: "EMAIL",
        phoneCountryCode: "SMS__COUNTRY_CODE",
        phone: "SMS",
        message: "JOB_TITLE"
      },
      extraFields: {
        email_address_check: "",
        locale: "en"
      }
    }
  }
};
