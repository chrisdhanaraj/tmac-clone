export const LUMA_DEFAULT_EVENT_SETTINGS = {
  require_rsvp_approval: true,
  show_guest_list: false,
  timezone: "America/Los_Angeles",
  max_capacity: 24,
  name_requirement: "full-name",
  phone_number_requirement: "required",
  visibility: "private",
  waitlist_enabled: true,
  registration_questions: [
    {
      id: "zi7v00bx",
      label: "What is your NTPR Rating?",
      options: ["2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5"],
      required: true,
      question_type: "dropdown",
    },
    {
      id: "aR8ECNmr",
      label: "What is your Instagram profile?",
      required: true,
      question_type: "instagram",
    },
    {
      id: "hmfqvmr0",
      label: "Are you a member of Mission Athletic Club",
      options: ["Yes", "No"],
      required: true,
      question_type: "dropdown",
    },
    {
      id: "ab1937vb",
      label:
        "Are you a contributor to this event? (If you don't know, then No)",
      options: ["Feeder", "Courtier", "No"],
      required: true,
      question_type: "dropdown",
    },
    {
      id: "3p5gvudd",
      label: "Terms and Conditions",
      terms: {
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "I filled out the liability form.",
                  type: "text",
                },
              ],
            },
          ],
        },
        content_type: "text",
        collect_signature: true,
      },
      required: true,
      question_type: "terms",
    },
  ],
};

export const LUMA_DESCRIPTION = {
  volley_and_vibes: (host: string, startTime: string) => {
    return `​Mission Athletic Club Presents Volleys & Vibes hosted by ${host}. 
    
Please arrive by ${startTime} for introductions and bring a fresh can of balls as your community donation 🎟️
    
​​​Please fill out the liability form to participate: https://forms.gle/9iz8714StKh4PaHeA
    
- Introduction
- Warm-ups
- Practice
- Game time

Come for the volleys, stay for the vibes.

Liveball Rules: https://www.youtube.com/watch?v=kZNBIb8x4B0`;
  },
  first_volleys: (host: string, startTime: string) => {
    return `
​Mission Athletic Club Presents First Volleys hosted by ${host}. This program is built for new members of the Mission Athletic Club. We give a bit of background about our community, how to engage, and run you through our marquee program, Volleys & Vibes.
​​
Please arrive by ${startTime} for introductions and bring a fresh can of balls as your community donation 🎟️

- Introduction
- Warm-ups
- Practice
- Game time

Come for the volleys, stay for the vibes.
​RULES: https://www.youtube.com/watch?v=kZNBIb8x4B0
    `;
  },
  vibras_and_voleas: (host: string, startTime: string) => {
    return `
¡Mission Athletic Club te invita a nuestra primera sesión de Vibras y Voleas, organizada por Fernanda!

🗓️ La sesión es completamente en español, así que prepárate para practicar y conectar en otro lenguaje.
​🎟️ Por favor llega a las ${startTime} para conocernos y empezar a pelotear.
​Y recuerda de traer una lata de pelotas como tu contribución a la comunidad.

"Hola a todos, les pedimos que completen el formulario de responsabilidad antes de participar en Volleys & Vibes. Es un requisito obligatorio. ¡Gracias!"

https://forms.gle/kdNH7bKVJBmdeFML6
​Agenda:
- ​Bienvenida y Presentaciones
- ​Calentamiento
- ​Práctica
- ​¡Liveball!

Mission Athletic Club Presents our first Vibras y Voleas Hosted by Fernanda.
​Ven por las voleas, quédate por las vibras. ¡Nos vemos en la cancha! 🎾✨
​This session is entirely in Spanish.

Please arrive by ${startTime} for introductions and bring a fresh can of balls as your community donation 🎟️

- Introduction
- Warm-ups
- Practice
- Game time

Come for the volleys, stay for the vibes.

Liveball Rules: https://www.youtube.com/watch?v=kZNBIb8x4B0
    `;
  },
  starters: (host: string, startTime: string) => {
    return `
Mission Athletic Club Presents: STARTERS hosted by ${host}

​​​This event is for 1.0 - 3.0 players who might feel intimidated by higher level players. Though we encourage you to join V&V, this might be a place where you can ease in and get a little more familiar.

Please arrive by ${startTime} for introductions and bring a fresh can of balls as your community donation 🎟️

- Introduction
- Warm-ups
- Practice
- Game time

Come for the volleys, stay for the vibes.

Liveball Rules: https://www.youtube.com/watch?v=kZNBIb8x4B0
`;
  },
  feeder_session: (host: string, startTime: string) => {
    return `​Mission Athletic Club Presents Feeder Session hosted by ${host}. 
    
Please arrive by ${startTime} for introductions and bring a fresh can of balls as your community donation 🎟️
    
​​​Please fill out the liability form to participate: https://forms.gle/9iz8714StKh4PaHeA
    
- Introduction
- Warm-ups
- Practice
- Game time

Come for the volleys, stay for the vibes.

Liveball Rules: https://www.youtube.com/watch?v=kZNBIb8x4B0`;
  },
};
