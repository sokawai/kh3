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
    partyInquiry: {
      // NOTE: Update formActionUrl when a dedicated Brevo form is created for party inquiries.
      // Currently shares the same endpoint as the newsletter/general form.
      formActionUrl: "https://3a63b53b.sibforms.com/serve/MUIFAHk5FiOTahhsv8ze2CDiOlE8pI1Wd9J29O1eWxvqc2vkKwM7Wse0nysLbPaJUG1sp3zN6V9CbvVH3FHlOIcOnAVjZPm1Byyvu_lbdR_nTQqySKxp9gVSdIcNmYj5A4p9RVZ9ajs0kzjMVrBu-rbYOO7kaazuR4ugymBnmibgvwNoARhMTFjvErVN22kN7S-bulOH-gJ7uuiWTA==",
      forceNativeSubmit: true,
      maxMessageChars: 2000,
      successMessage: "Thank you for your inquiry. Our team will reach out to you within one business day.",
      errorMessage: "Our party inquiry form is temporarily unavailable. Please email us at kenchahouse@gmail.com.",
      debugErrors: false,
      fields: {
        firstName: "FIRSTNAME",
        lastName: "LASTNAME",
        email: "EMAIL",
        phone: "SMS",
        message: "JOB_TITLE"
      },
      extraFields: {
        email_address_check: "",
        locale: "en",
        SMS__COUNTRY_CODE: "+1"
      },
      backupEmail: {
        to: "kenchahouse@gmail.com",
        subject: "Kencha House Party Inquiry",
        sourcePage: "parties.html"
      }
    },
    studioInquiry: {
      // NOTE: Update formActionUrl when a dedicated Brevo form is created for studio inquiries.
      // Currently shares the same endpoint as the newsletter/general form.
      formActionUrl: "https://3a63b53b.sibforms.com/serve/MUIFAHk5FiOTahhsv8ze2CDiOlE8pI1Wd9J29O1eWxvqc2vkKwM7Wse0nysLbPaJUG1sp3zN6V9CbvVH3FHlOIcOnAVjZPm1Byyvu_lbdR_nTQqySKxp9gVSdIcNmYj5A4p9RVZ9ajs0kzjMVrBu-rbYOO7kaazuR4ugymBnmibgvwNoARhMTFjvErVN22kN7S-bulOH-gJ7uuiWTA==",
      forceNativeSubmit: true,
      maxMessageChars: 2000,
      successMessage: "Thank you for your inquiry. Our team will reach out to you within one business day.",
      errorMessage: "Our studio inquiry form is temporarily unavailable. Please email us at kenchahouse@gmail.com.",
      debugErrors: false,
      fields: {
        firstName: "FIRSTNAME",
        lastName: "LASTNAME",
        email: "EMAIL",
        phone: "SMS",
        message: "JOB_TITLE"
      },
      extraFields: {
        email_address_check: "",
        locale: "en",
        SMS__COUNTRY_CODE: "+1"
      },
      backupEmail: {
        to: "kenchahouse@gmail.com",
        subject: "Kencha House Studio Inquiry",
        sourcePage: "studio.html"
      }
    }
  }
};
