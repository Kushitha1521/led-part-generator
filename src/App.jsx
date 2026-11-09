
import { useState } from "react";
import {
  Zap,
  Copy,
  Check,
  RotateCcw,
  Settings2,
  Cable,
  CircleHelp,
  ChevronDown,
  Cpu,
  ScanSearch,
  ArrowRightLeft,
} from "lucide-react";

const parameters = [
  {
    id: "fixedPart",
    number: "01",
    label: "Fixed Part",
    description: "Controller connection",
    options: [{ label: "USB", value: "USB" }],
  },
  {
    id: "guides",
    number: "02",
    label: "Number of Guides",
    description: "Select guide quantity",
    options: [
      { label: "01 Guide", value: "01" },
      { label: "02 Guides", value: "02" },
    ],
  },
  {
    id: "button",
    number: "03",
    label: "Push Button Type",
    description: "Button design",
    options: [
      { label: "Round", value: "R" },
      { label: "Square", value: "S" },
      { label: "No Button", value: "N" },
    ],
  },
  {
    id: "led01Color",
    number: "04",
    label: "LED01 Color",
    description: "Select LED01 color independently",
    options: [
      { label: "Red", value: "R" },
      { label: "Blue", value: "B" },
      { label: "White", value: "W" },
      { label: "Green", value: "G" },
    ],
  },
  {
    id: "led02Color",
    number: "05",
    label: "LED02 Color",
    description: "Select LED02 color independently; unavailable with 01 guide",
    options: [
      { label: "Red", value: "R" },
      { label: "Blue", value: "B" },
      { label: "White", value: "W" },
      { label: "Green", value: "G" },
    ],
  },
  {
    id: "tubeSize",
    number: "06",
    label: "Tube Size",
    description: "Tube diameter",
    options: [
      { label: "2 mm", value: "2" },
      { label: "3 mm", value: "3" },
    ],
  },
  {
    id: "guideColor",
    number: "07",
    label: "Light Guide Type",
    description: "Select the light guide construction",
    options: [
      { label: "Woven piping - Yellow", value: "Y" },
      { label: "Woven piping - Red", value: "R" },
      { label: "Braided Tubing", value: "B" },
      { label: "Naked Cable", value: "N" },
    ],
  },
];

const lengthParameters = [
  {
    id: "ledWire",
    number: "08",
    label: "LED Wire Length",
    description: "LED connection wire",
    digits: 3,
    defaultValue: "150",
  },
  {
    id: "lightguideLength",
    number: "09",
    label: "Light Guide Length",
    description: "Light guide length",
    digits: 4,
    defaultValue: "380",
  },
  {
    id: "buttonWire",
    number: "10",
    label: "Push Button Wire Length",
    description: "Button connection wire",
    digits: 3,
    defaultValue: "260",
  },
];

const initialValues = {
  fixedPart: "USB",
  guides: "01",
  button: "R",
  led01Color: "G",
  led02Color: "G",
  tubeSize: "2",
  guideColor: "Y",
  ledWire: "150",
  lightguideLength: "380",
  buttonWire: "260",
};

const colorNames = {
  R: "Red",
  B: "Blue",
  W: "White",
  G: "Green",
};

const guideTypeNames = {
  Y: "Woven piping - Yellow",
  R: "Woven piping - Red",
  B: "Braided Tubing",
  N: "Naked Cable",
};

const buttonNames = {
  R: "Round",
  S: "Square",
  N: "No Button",
};

const tubeNames = {
  2: "2 mm",
  3: "3 mm",
};

function formatNumber(value, digits) {
  return String(value || "0").padStart(digits, "0");
}

function generatePartNumber(values) {
  const buttonWire = values.button === "N"
    ? "000"
    : formatNumber(values.buttonWire, 3);

  return [
    values.fixedPart,
    values.guides,
    values.button,
    values.led01Color,
    values.guides === "01" ? "X" : values.led02Color,
    values.tubeSize,
    values.guideColor,
    formatNumber(values.ledWire, 3),
    formatNumber(values.lightguideLength, 4),
    buttonWire,
  ].join("");
}

function decodePartNumber(partNumber) {
  const code = partNumber.trim().toUpperCase();

  // LED02 uses X when only one guide is selected.
  const pattern = /^USB(01|02)(R|S|N)(R|B|W|G)(R|B|W|G|X)(2|3)(Y|R|B|N)(\d{3})(\d{4})(\d{3})$/;
  const match = code.match(pattern);

  if (!match) {
    return {
      success: false,
      message: "Invalid part number. Please enter a valid 20-character code.",
    };
  }

  const [
    ,
    guides,
    button,
    led01Color,
    led02Color,
    tubeSize,
    guideColor,
    ledWire,
    lightguideLength,
    buttonWire,
  ] = match;

  if (guides === "01" && led02Color !== "X") {
    return {
      success: false,
      message: "For 01 guide, LED02 must be set to X.",
    };
  }

  if (guides === "02" && led02Color === "X") {
    return {
      success: false,
      message: "For 02 guides, select a valid LED02 color.",
    };
  }

  if (button === "N" && buttonWire !== "000") {
    return {
      success: false,
      message: "A controller without a push button must have button wire length 000.",
    };
  }

  return {
    success: true,
    values: {
      fixedPart: "USB",
      guides,
      button,
      led01Color,
      led02Color,
      tubeSize,
      guideColor,
      ledWire,
      lightguideLength,
      buttonWire,
    },
    message: "Part number decoded successfully.",
  };
}

function App() {
  const [values, setValues] = useState(initialValues);
  const [copied, setCopied] = useState(false);

  const [decodeInput, setDecodeInput] = useState("");
const [decodeMessage, setDecodeMessage] = useState("");
const [decodeError, setDecodeError] = useState(false);
const [decodedValues, setDecodedValues] = useState(null);

  const partNumber = generatePartNumber(values);

  const updateValue = (id, value) => {
    setValues((prev) => {
      const next = {
        ...prev,
        [id]: value,
      };

      // LED01 and LED02 colors remain independent. The part number
      // automatically uses X for LED02 when only one guide is selected.

      // No push button means no button wire.
      if (id === "button" && value === "N") {
        next.buttonWire = "000";
      }

      // Restore the default wire length when a button is selected.
      if (id === "button" && value !== "N" && prev.button === "N") {
        next.buttonWire = "260";
      }

      return next;
    });

    setCopied(false);
    setDecodeMessage("");
  };

  const resetConfiguration = () => {
    setValues(initialValues);
    setDecodeInput("");
    setCopied(false);
    setDecodeMessage("");
    setDecodeError(false);
  };

  const copyPartNumber = async () => {
    try {
      await navigator.clipboard.writeText(partNumber);
      setCopied(true);
    } catch (error) {
      console.error("Clipboard error:", error);
      alert("Unable to copy the part number.");
    }
  };

  
const handleDecode = () => {
  const result = decodePartNumber(decodeInput);

  setDecodeMessage(result.message);
  setDecodeError(!result.success);

  if (result.success) {
    setDecodedValues(result.values);
  } else {
    setDecodedValues(null);
  }
};

  const getSelectedLabel = (parameter) => {
    if (parameter.id === "led02Color" && values.guides === "01") {
      return "Not applicable (X)";
    }

    const selected = parameter.options.find(
      (option) => option.value === values[parameter.id]
    );

    return selected?.label || values[parameter.id];
  };

  const summary = [
    ...parameters.map((parameter) => ({
      label: parameter.label,
      value: getSelectedLabel(parameter),
    })),
    ...lengthParameters.map((parameter) => ({
      label: parameter.label,
      value: `${formatNumber(
        values[parameter.id],
        parameter.digits
      )} mm`,
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-white">
              <Zap size={23} fill="currentColor" />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight">
                LED Configurator
              </h1>
              <p className="text-xs text-slate-500">
                Part Number Generator & Decoder
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">
              Configuration Tool
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        
        
{/* Responsive Hero Banner */}
<section className="py-6 sm:py-8">
  <div className="overflow-hidden rounded-2xl bg-blue-950">

    {/* Text section */}
    <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
      <span className="text-xs font-semibold uppercase tracking-widest text-blue-300">
        LED Controller
      </span>

      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
        Configure.
        <br />
        Generate. Decode.
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
        Configure your LED controller parameters, generate part numbers,
        and decode existing part numbers easily.
      </p>
    </div>

    {/* Image section */}
    <div className="w-full">
      <img
        src="/led-controller-banner.png"
        alt="LED Controller"
        className="block h-auto w-full object-cover"
      />
    </div>

  </div>
</section>

{/* Responsive product cards */}
<section className="pb-8">
  <div className="mb-4">
    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Explore Our Components</h2>
    <p className="mt-1 text-sm text-slate-500">Discover the components used in the LED controller.</p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[
      { name: "Light Guides", image: "/images/light-guide-table.jpeg", description: "Type of Light Guides" },
      { name: "Naked Cable", image: "/images/naked-cable.jpeg", description: "Naked cable options" },
      { name: "Woven Piping", image: "/images/woven-piping.jpeg", description: "Woven piping options" },
      { name: "Braided Tubing", image: "/images/braided-tubing.jpeg", description: "Protective braided tubing" },
    ].map((card) => (
      <article key={card.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900">{card.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{card.description}</p>
        </div>
      </article>
    ))}
  </div>
</section>


        {/* Page Heading */}
        <section className="pb-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-blue-700">
            <Cpu size={15} />
            PRODUCT CONFIGURATION
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            LED Controller Part Number
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Select the required specifications or enter an
            existing part number to decode its configuration.
          </p>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.65fr_1fr]">
          {/* Configuration Panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Settings2 size={20} className="text-blue-700" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Configure Parameters
                  </h3>
                </div>

                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  Select the required specifications below.
                </p>
              </div>

              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                10 Parameters
              </span>
            </div>

            {/* Dropdown Parameters */}
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
              {parameters.map((parameter) => (
                <div key={parameter.id}>
                  <label
                    htmlFor={parameter.id}
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <span className="text-[10px] font-bold text-slate-400">
                      {parameter.number}
                    </span>
                    {parameter.label}
                  </label>

                  <div className="relative">
                    <select
                      id={parameter.id}
                      value={parameter.id === "led02Color" && values.guides === "01" ? "X" : values[parameter.id]}
                      disabled={parameter.id === "led02Color" && values.guides === "01"}
                      onChange={(event) =>
                        updateValue(parameter.id, event.target.value)
                      }
                      className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
                        parameter.id === "led02Color" && values.guides === "01"
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-700 focus:bg-white"
                      }`}
                    >
                      {parameter.id === "led02Color" && values.guides === "01" ? (
                        <option value="X">Not applicable (X)</option>
                      ) : (
                        parameter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} ({option.value})
                          </option>
                        ))
                      )}
                    </select>

                    {!(parameter.id === "led02Color" && values.guides === "01") && (
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    )}
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {parameter.id === "led02Color" && values.guides === "01"
                      ? "Disabled — only one guide selected (X)"
                      : parameter.description}
                  </p>
                </div>
              ))}

              {/* Length Parameters */}
              {lengthParameters.map((parameter) => {
                const isButtonWire = parameter.id === "buttonWire";
                const isDisabled = isButtonWire && values.button === "N";

                return (
                  <div key={parameter.id}>
                    <label
                      htmlFor={parameter.id}
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <span className="text-[10px] font-bold text-slate-400">
                        {parameter.number}
                      </span>
                      {parameter.label}
                    </label>

                    <div
                      className={`flex items-center rounded-xl border transition ${
                        isDisabled
                          ? "border-slate-200 bg-slate-100"
                          : "border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50"
                      }`}
                    >
                      <input
                        id={parameter.id}
                        type="number"
                        min="0"
                        max={10 ** parameter.digits - 1}
                        disabled={isDisabled}
                        value={
                          isDisabled
                            ? "000"
                            : values[parameter.id]
                        }
                        onChange={(event) => {
                          const raw = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, parameter.digits);

                          updateValue(parameter.id, raw);
                        }}
                        className="w-full min-w-0 rounded-xl bg-transparent px-4 py-3 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      />

                      <span className="pr-4 text-xs font-medium text-slate-400">
                        mm
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {isDisabled
                        ? "Automatically set to 000"
                        : `${parameter.description} (${parameter.digits} digits)`}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Form Footer */}
            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={resetConfiguration}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={14} />
                Reset Configuration
              </button>

              <p className="text-center text-xs text-slate-400 sm:text-right">
                Changes update automatically
              </p>
            </div>
          </section>

          {/* Result Panel */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Cable size={22} />
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
                  GENERATED OUTPUT
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Part Number
                </h3>
              </div>
            </div>

            {/* Generated Code */}
            <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-5 text-center">
              <p className="break-all text-lg font-extrabold leading-8 tracking-wide text-blue-900 sm:text-xl">
                {partNumber}
              </p>
            </div>

            <button
              onClick={copyPartNumber}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition ${
                copied
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-950 hover:bg-blue-900"
              }`}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied to Clipboard" : "Copy Part Number"}
            </button>

           
            {/* Summary */}
            <div className="my-6 border-t border-slate-100" />

            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                Configuration Summary
              </h4>
              <span className="text-xs text-slate-400">
                10 Items
              </span>
            </div>

            <div className="space-y-3.5">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-slate-500">
                    {item.label}
                  </span>

                  <span className="text-right text-xs font-semibold text-slate-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Information */}
            <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 p-3.5">
              <CircleHelp
                size={16}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <p className="text-[11px] leading-5 text-slate-500">
                Verify the selected specifications before using
                this part number in production.
              </p>
            </div>
          </aside>
        </div>

        
{/* Part Number Decoder Section */}
<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
  {/* Decoder Heading */}
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-blue-700">
        <ScanSearch size={16} />
        PART NUMBER ANALYSIS
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
        Part Number Decoder
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Enter an existing LED controller part number to
        understand its specifications.
      </p>
    </div>

    <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
      20 Character Format
    </span>
  </div>

  {/* Input */}
  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      type="text"
      value={decodeInput}
      maxLength={20}
      onChange={(event) => {
        setDecodeInput(event.target.value.toUpperCase());
        setDecodeMessage("");
        setDecodeError(false);
        setDecodedValues(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleDecode();
        }
      }}
      placeholder="Enter a 20-character part number"
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-sm uppercase outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
    />

    <button
      onClick={handleDecode}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-900"
    >
      <ScanSearch size={17} />
      Decode Part Number
    </button>
  </div>

  {/* Decode Status */}
  {decodeMessage && (
    <div
      className={`mt-4 rounded-xl border p-4 text-sm ${
        decodeError
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        {decodeError ? (
          <CircleHelp size={17} />
        ) : (
          <Check size={17} />
        )}

        {decodeMessage}
      </div>
    </div>
  )}

  {/* Decoded Result */}
  {decodedValues && (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-col gap-3 bg-blue-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-200">
            DECODED PART NUMBER
          </p>

          <p className="mt-1 break-all font-mono text-lg font-bold tracking-wide text-white">
            {generatePartNumber(decodedValues)}
          </p>
        </div>

        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                generatePartNumber(decodedValues)
              );
            } catch (error) {
              console.error("Clipboard error:", error);
              alert("Unable to copy the decoded part number.");
            }
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
        >
          <Copy size={14} />
          Copy Code
        </button>
      </div>

      <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Fixed Part",
            value: decodedValues.fixedPart,
          },
          {
            label: "Number of Guides",
            value: decodedValues.guides === "01" ? "01 Guide" : "02 Guides",
          },
          {
            label: "Push Button Type",
            value: buttonNames[decodedValues.button],
          },
          {
            label: "LED01 Color",
            value: `${colorNames[decodedValues.led01Color]} (${decodedValues.led01Color})`,
          },
          {
            label: "LED02 Color",
            value: decodedValues.led02Color === "X" ? "Not applicable (X)" : `${colorNames[decodedValues.led02Color]} (${decodedValues.led02Color})`,
          },
          {
            label: "Tube Size",
            value: tubeNames[decodedValues.tubeSize],
          },
          {
            label: "Light Guide Type",
            value: guideTypeNames[decodedValues.guideColor],
          },
          {
            label: "LED Wire Length",
            value: `${decodedValues.ledWire} mm`,
          },
          {
            label: "Light Guide Length",
            value: `${decodedValues.lightguideLength} mm`,
          },
          {
            label: "Push Button Wire Length",
            value: `${decodedValues.buttonWire} mm`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 bg-white p-4"
          >
            <span className="text-xs text-slate-500">
              {item.label}
            </span>

            <span className="text-right text-sm font-semibold text-slate-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}
</section>


        {/* About Tool */}
        <section className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CircleHelp size={21} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-blue-950">
                About This Tool
              </h3>

              <p className="mt-2 text-xs leading-6 text-blue-900/75 sm:text-sm">
                This tool helps you generate LED controller part
                numbers and decode existing ones. Select your
                specifications or enter a part number to
                understand its configuration.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>LED Controller Configuration System</p>
          <p>Engineering Part Number Generator</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
