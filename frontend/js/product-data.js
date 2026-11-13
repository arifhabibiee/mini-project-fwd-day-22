// Static product data for the hardcoded page only (no API/Docker required).
// DAY 22 DEMO: maxPerOrder is unknown (null), Black stock 5, Silver stock 10. Values are simulated, not official.
// IDs are local identifiers, not database IDs.
export const staticProduct = {
  id: 1,
  slug: "mw75-tumi",
  name: "MW75 TUMI",
  subtitle: "Noise-Cancelling Wireless Headphones",
  description:
    "MW75 combines 40mm beryllium drivers with Adaptive Active Noise Cancellation to deliver detailed sound while giving the listener flexible control over outside noise.\n\nIts lightweight anodized aluminum construction and soft lambskin leather are designed for extended listening in a distinctive over-ear form.",
  priceMinor: 75000,
  currency: "USD",
  defaultVariantId: 1,
  quantityPolicy: {
    min: 1,
    maxPerOrder: null,
  },
  variants: [
    {
      id: 1,
      colorCode: "black",
      label: "Black",
      referenceVariantId: "45871965307072",
      availability: "available",
      stockQuantity: 5,
      isDefault: true,
      position: 0,
      purchasable: true,
      images: [
        {
          id: 1,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75B_TUMI_800x800_Hero.png?v=1769444695\u0026width=800",
          alt: "Black MW75 TUMI wireless headphones, view 1",
          position: 0,
          fallbackUrl: "/assets/mw75-black-fallback.svg",
        },
        {
          id: 2,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75B_TUMI_800x800_Front.png?v=1769444695\u0026width=800",
          alt: "Black MW75 TUMI wireless headphones, view 2",
          position: 1,
          fallbackUrl: "/assets/mw75-black-fallback.svg",
        },
        {
          id: 3,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75B_TUMI_800x800_Engraving.png?v=1769444695\u0026width=800",
          alt: "Black MW75 TUMI wireless headphones, view 3",
          position: 2,
          fallbackUrl: "/assets/mw75-black-fallback.svg",
        },
        {
          id: 4,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75B_TUMI_800x800_Straight_8b6fd9c0-e214-42cd-b617-eac997922263.png?v=1769444695\u0026width=800",
          alt: "Black MW75 TUMI wireless headphones, view 4",
          position: 3,
          fallbackUrl: "/assets/mw75-black-fallback.svg",
        },
      ],
    },
    {
      id: 2,
      colorCode: "silver",
      label: "Silver",
      referenceVariantId: null,
      availability: "available",
      stockQuantity: 10,
      isDefault: false,
      position: 1,
      purchasable: true,
      images: [
        {
          id: 5,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75S_TUMI_800x800_Hero.png?v=1769444695\u0026width=800",
          alt: "Silver MW75 TUMI wireless headphones, view 1",
          position: 0,
          fallbackUrl: "/assets/mw75-silver-fallback.svg",
        },
        {
          id: 6,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75S_TUMI_800x800_Front.png?v=1769444695\u0026width=800",
          alt: "Silver MW75 TUMI wireless headphones, view 2",
          position: 1,
          fallbackUrl: "/assets/mw75-silver-fallback.svg",
        },
        {
          id: 7,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75S_TUMI_800x800_Engraving.png?v=1769444695\u0026width=800",
          alt: "Silver MW75 TUMI wireless headphones, view 3",
          position: 2,
          fallbackUrl: "/assets/mw75-silver-fallback.svg",
        },
        {
          id: 8,
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75S_TUMI_800x800_Straight_f01c8c31-58db-4162-a823-25764eae06d7.png?v=1769444571\u0026width=800",
          alt: "Silver MW75 TUMI wireless headphones, view 4",
          position: 3,
          fallbackUrl: "/assets/mw75-silver-fallback.svg",
        },
      ],
    },
  ],
  content: {
    eyebrow: "MASTER \u0026 DYNAMIC FOR TUMI",
    features: [
      {
        title: "Adaptive",
        text: "ANC",
        iconKey: "anc",
      },
      {
        title: "Anodized aluminum,",
        text: "tempered glass \u0026 lambskin leather",
        iconKey: "materials",
      },
      {
        title: "40mm",
        text: "beryllium drivers",
        iconKey: "drivers",
      },
      {
        title: "32",
        text: "hours of listening",
        iconKey: "battery",
      },
      {
        title: "Bluetooth®",
        text: "5.1",
        iconKey: "bluetooth",
      },
      {
        title: "4",
        text: "beamforming microphones",
        iconKey: "microphones",
      },
    ],
    benefits: [
      {
        title: "Free Shipping",
        text: "Free ground shipping on orders of $99 or more in the U.S.",
      },
      {
        title: "Free Returns",
        text: "We offer a 14-day return policy, allowing you to shop with confidence.",
      },
      {
        title: "Product Protection",
        text: "Manufacturer warranty for manufacturing defects or issues.",
      },
    ],
    protection: {
      title: "Enhance your purchase with protection",
      note: "Optional product protection entry point",
    },
    stories: [
      {
        eyebrow: "MASTER \u0026 DYNAMIC FOR",
        title: "TUMI",
        paragraphs: [
          "A premium audio collaboration with TUMI that brings the brand’s recognizable 19 Degree design language to travel-ready noise-cancelling sound tools, combining precise engineering with a refined visual identity.",
        ],
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/TUMI_PDPBrandFeatureImage_V1.png?v=1753814090\u0026width=1200",
          alt: "Master \u0026 Dynamic for TUMI collaboration visual",
          fallbackUrl: "/assets/story-fallback.svg",
        },
        links: [],
      },
      {
        eyebrow: "MW75",
        title: "Active Noise-Cancelling Wireless Headphones",
        paragraphs: [
          "MW75 combines 40mm beryllium drivers with Adaptive Active Noise Cancellation to deliver detailed sound while giving the listener flexible control over outside noise.",
          "Its lightweight anodized aluminum construction and soft lambskin leather are designed for extended listening in a distinctive over-ear form.",
        ],
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75B_TUMI-PDPFeatureImage_V1.png?v=1753812946\u0026width=1200",
          alt: "MW75 TUMI product lifestyle visual",
          fallbackUrl: "/assets/story-fallback-light.svg",
        },
        links: [
          {
            label: "Learn more about MW75",
            url: "https://www.masterdynamic.com/products/mw75-active-noise-cancelling-wireless-headphones",
          },
          {
            label: "Discover the full TUMI collaboration",
            url: "https://www.masterdynamic.com/pages/tumi-collaboration",
          },
        ],
      },
    ],
    specGroups: [
      {
        title: "Materials and Design",
        rows: [
          {
            label: "Materials",
            value:
              "Lambskin leather headband and ear pads / anodized aluminum controls",
          },
          {
            label: "Dimensions",
            value: "160.75mm × 197.83mm × 83.57mm",
          },
          {
            label: "Weight",
            value: "338g",
          },
          {
            label: "Ear Coupling",
            value: "Over-Ear",
          },
          {
            label: "Ear Pads",
            value: "Replaceable magnetic lambskin-wrapped memory foam",
          },
        ],
      },
      {
        title: "Sound and Features",
        rows: [
          {
            label: "Drivers",
            value: "40mm beryllium",
          },
          {
            label: "Impedance",
            value: "32 Ohms",
          },
          {
            label: "Talk Microphones",
            value: "4 Microphone talk solution with wind protection",
          },
          {
            label: "ANC Microphones",
            value: "4 Microphone ANC solution",
          },
          {
            label: "Voice Assistant",
            value: "Compatible with native voice assistants",
          },
        ],
      },
      {
        title: "Connectivity and Charging",
        rows: [
          {
            label: "Battery Life",
            value: "Up to 32 hours, or up to 28 hours with ANC enabled",
          },
          {
            label: "Bluetooth Profile",
            value:
              "Bluetooth® 5.1 range of 100ft / 30m with AAC, aptX™ Adaptive up to 24-bit / 48kHz, and SBC",
          },
          {
            label: "Wired Digital",
            value:
              "Hi-res audio up to 24-bit / 96kHz with the provided USB-C to USB-C cable on supported devices",
          },
          {
            label: "Analog Connection",
            value: "USB-C to 3.5mm cable",
          },
          {
            label: "Antenna",
            value: "Internal antenna",
          },
        ],
      },
    ],
    boxItems: [
      {
        label: "Wireless Headphones",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75TUMI_WhatsIntheBox_300x300-1.png?v=1736453489\u0026width=300",
          alt: "MW75 TUMI Wireless Headphones",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: "USB-C to USB-C Charging Cable",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MH40W_L-Uniform_In-The-Box-USC-CtoUSB-C.png?v=1729024091\u0026width=1667",
          alt: "USB-C to USB-C Charging Cable",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: "USB-C to 3.5mm Audio Cable",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MH40W_L-Uniform_In-The-Box-3.5mmtoUSB-C.png?v=1729024091\u0026width=1667",
          alt: "USB-C to 3.5mm Audio Cable",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: "USB-C to USB-A Adapter",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75_TUMI_WhatsIntheBox-USB-CUSB-AAdapter_300x300-V1.png?v=1753813779\u0026width=400",
          alt: "USB-C to USB-A Adapter",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: '3.5mm to 1/4" Adapter',
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75_Lamborghini-In_tne_box_05_a0d6c39a-7ebb-4024-8961-a1f2386ea484.png?v=1693329912\u0026width=331",
          alt: "3.5mm to one-quarter inch Adapter",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: "Flight Adapter",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MH40W_L-Uniform_In-The-Box-Adapter.png?v=1729024091\u0026width=1667",
          alt: "Flight Adapter",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
      {
        label: "Hard Shell Travel Case",
        media: {
          url: "https://www.masterdynamic.com/cdn/shop/files/MW75_TUMI_WhatsIntheBox-HardCase_300x300-1.png?v=1753813779\u0026width=300",
          alt: "Hard Shell Travel Case",
          fallbackUrl: "/assets/item-fallback.svg",
        },
      },
    ],
    support: {
      eyebrow: "PRODUCT SUPPORT",
      title:
        "Need support? We\u0027re here to assist you every step of the way.",
      text: "Access product support and frequently asked questions in our Support Center.",
      media: {
        url: "https://www.masterdynamic.com/cdn/shop/files/MD_Support_Homepage_Desktop-20240711.jpg?v=1720732174\u0026width=1600",
        alt: "Master \u0026 Dynamic product support",
        fallbackUrl: "/assets/support-fallback.svg",
      },
      link: {
        label: "Support Center",
        url: "https://support.masterdynamic.com/",
      },
    },
  },
};
