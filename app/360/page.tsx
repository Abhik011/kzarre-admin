"use client";
import { useEffect, useState } from "react";
import {
    User,
    MapPin,
    Mail,
    Phone,
    ShieldAlert,
    CalendarCheck,
    FileText,
    PlusCircle,
    X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */
type Customer = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    addresses: string[];
    tags: string[];
    consentEmail: boolean;
    consentSms: boolean;
    metrics?: {
        ltv: number;
        aov: number;
        returnRate: number;
    };
};
type NoteRecord = {
    _id: string;
    customerId: string;
    message: string;
    createdAt: string;
    createdBy?: string;
};


type TimelineItem = {
    _id: string;
    type: "order" | "ticket" | "chat" | "email" | "note";
    title: string;
    description?: string;
    createdAt: string;
};

type PromiseRecord = {
    _id: string;
    type: "replacement" | "discount" | "delivery";
    status: "pending" | "fulfilled" | "breached";
    dueDate: string;
    notes?: string;
    attachmentUrl?: string;
};

/* =========================================================
   MAIN CRM PAGE
========================================================= */
export default function MiniCRMPage() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [promises, setPromises] = useState<PromiseRecord[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
        null
    );

    const [refundOverride, setRefundOverride] = useState(false);
    const [guardrailBlocked, setGuardrailBlocked] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [notes, setNotes] = useState<NoteRecord[]>([]);
    const [noteText, setNoteText] = useState("");
    const [savingNote, setSavingNote] = useState(false);


    /* ✅ CREATE PROMISE UI STATE */
    const [showPromiseForm, setShowPromiseForm] = useState(false);
    const [promiseForm, setPromiseForm] = useState({
        type: "replacement",
        dueDate: "",
        notes: "",
    });
    const [allPromises, setAllPromises] = useState<PromiseRecord[]>([]);
    /* =========================================================
       SEARCH CUSTOMER
    ========================================================= */
    const searchCustomer = async (value?: string) => {
        try {
            if (!value || !value.trim()) return;

            const cleanValue = value.trim();
            setNotFound(false);

            const params =
                cleanValue.includes("@")
                    ? `email=${encodeURIComponent(cleanValue)}`
                    : cleanValue.length === 24
                        ? `orderId=${encodeURIComponent(cleanValue)}`
                        : `phone=${encodeURIComponent(cleanValue)}`;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/search?${params}`,
                { credentials: "include" }
            );

            if (!res.ok) {
                setCustomer(null);
                setSelectedCustomerId(null);
                setNotFound(true);
                return;
            }

            const data = await res.json();
            setCustomer(data);
            setSelectedCustomerId(data._id);
            setNotFound(false);
        } catch {
            setCustomer(null);
            setSelectedCustomerId(null);
            setNotFound(true);
        }
    };

    /* =========================================================
       FETCH TIMELINE & PROMISES
    ========================================================= */
    useEffect(() => {
        if (!selectedCustomerId) return;
        fetchTimeline();
        fetchPromises();
        fetchNotes(); // ✅ ADD THIS
    }, [selectedCustomerId]);




    const fetchTimeline = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/timeline/${selectedCustomerId}`,
            { credentials: "include" }
        );
        const data = await res.json();
        setTimeline(Array.isArray(data) ? data : []);
    };

    const fetchPromises = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/promises/${selectedCustomerId}`,
            { credentials: "include" }
        );
        const data = await res.json();
        setPromises(Array.isArray(data) ? data : []);
    };
    const fetchNotes = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/notes/${selectedCustomerId}`,
            { credentials: "include" }
        );

        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
    };

    const createNote = async () => {
        if (!noteText.trim() || !customer) return;

        setSavingNote(true);

        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/notes/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                customerId: customer._id,
                message: noteText,
            }),
        });

        setNoteText("");
        setSavingNote(false);
        fetchNotes();     // ✅ refresh notes
        fetchTimeline();  // ✅ also refresh unified timeline
    };


    /* =========================================================
       ✅ CREATE PROMISE
    ========================================================= */
    const createPromise = async () => {
        if (!promiseForm.dueDate || !customer) {
            alert("Select due date");
            return;
        }

        await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/crm/promises/create`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    customerId: customer._id,
                    type: promiseForm.type,
                    dueDate: promiseForm.dueDate,
                    notes: promiseForm.notes,
                }),
            }
        );

        setShowPromiseForm(false);
        setPromiseForm({ type: "replacement", dueDate: "", notes: "" });
        fetchPromises();
    };

    /* =========================================================
       DISPUTE GUARDRAILS
    ========================================================= */
    const attemptRefund = () => {
        const hasOpen = promises.some(
            (p) => p.status === "pending" || p.status === "breached"
        );

        if (hasOpen && !refundOverride) {
            setGuardrailBlocked(true);
            return;
        }

        alert("✅ Refund allowed by policy.");
        setGuardrailBlocked(false);
    };

    /* =========================================================
       UI
    ========================================================= */
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <User /> Customer 360
            </h1>

            <div className="flex flex-wrap gap-2 items-center">
                <input
                    className="border p-2 rounded w-full max-w-md bg-[var(--background-card)] border-[var(--sidebar-border)]"
                    placeholder="Search by Order ID / Phone / Email"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const value = (e.target as HTMLInputElement).value;
                            searchCustomer(value);
                        }
                    }}
                    id="crm-search"
                />

                {/* ✅ SEARCH BUTTON */}
                <button
                    onClick={() => {
                        const input = document.getElementById(
                            "crm-search"
                        ) as HTMLInputElement;
                        searchCustomer(input.value);
                    }}
                    className="px-4 py-2 rounded bg-[var(--background-card)] gap-1 border border-[var(--sidebar-border)] text-black  text-sm"
                >
                    Search
                </button>

                {/* ✅ CLEAR BUTTON */}
                <button
                    onClick={() => {
                        setCustomer(null);
                        setTimeline([]);
                        setPromises([]);
                        setSelectedCustomerId(null);
                        setNotFound(false);

                        const input = document.getElementById(
                            "crm-search"
                        ) as HTMLInputElement;
                        if (input) input.value = "";
                    }}
                    className="px-4 py-2 rounded bg-[var(--background-card)] border border-[var(--sidebar-border)] text-sm"
                >
                    Clear
                </button>
            </div>


            {notFound && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm max-w-md">
                    ❌ Customer not found.
                </div>
            )}

            {!customer ? (
                <div className="text-gray-500">Load a customer to view CRM data.</div>
            ) : (
                <>
                    {/* ================= CUSTOMER PROFILE ================= */}
                    <div className="border rounded-xl overflow-hidden">
                        <div className="p-4 font-semibold bg-[var(--background-card)] gap-1 border border-[var(--sidebar-border)]" >
                            Customer Profile
                        </div>

                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">Name</td>
                                    <td className="px-4 py-2">{customer.name}</td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">Email</td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <Mail size={14} /> {customer.email}
                                    </td>
                                </tr>

                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">Phone</td>
                                    <td className="px-4 py-2 flex gap-2">
                                        <Phone size={14} /> {customer.phone || "-"}
                                    </td>
                                </tr>

                                <tr className="border-t align-top">
                                    <td className="px-4 py-2 font-medium">Addresses</td>
                                    <td className="px-4 py-2">
                                        {Array.isArray(customer.addresses) &&
                                            customer.addresses.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {customer.addresses.map((a, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <MapPin size={14} /> {a}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ================= LIFETIME METRICS ================= */}
                    <div className="border rounded-xl overflow-hidden">
                        <div className="p-4 font-semibold b bg-[var(--background-card)] gap-1 border border-[var(--sidebar-border)]">
                            Lifetime Metrics
                        </div>

                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">LTV</td>
                                    <td className="px-4 py-2">
                                        ₹{customer.metrics?.ltv ?? 0}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">AOV</td>
                                    <td className="px-4 py-2">
                                        ₹{customer.metrics?.aov ?? 0}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-4 py-2 font-medium">Return Rate</td>
                                    <td className="px-4 py-2">
                                        {customer.metrics?.returnRate ?? 0}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ================= UNIFIED TIMELINE ================= */}
                    <div className="border rounded-xl p-4 space-y-2">
                        <h2 className="font-semibold flex items-center gap-2">
                            <FileText size={18} /> Unified Timeline
                        </h2>

                        {timeline.length === 0 ? (
                            <div className="text-gray-500 text-sm">
                                No activity recorded.
                            </div>
                        ) : (
                            timeline.map((item) => (
                                <div
                                    key={item._id}
                                    className="border-b py-2 flex justify-between text-sm"
                                >
                                    <div>
                                        <b>{item.type.toUpperCase()}</b> — {item.title}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ================= CUSTOMER PROMISES + CREATE ================= */}
                    <div className="border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2">
                                <CalendarCheck size={18} /> Customer Promises
                            </h2>

                            <button
                                onClick={() => setShowPromiseForm(!showPromiseForm)}
                                className="flex items-center bg-[var(--background-card)] gap-1 border border-[var(--sidebar-border)] text-black px-3 py-1 rounded text-sm"
                            >
                                {showPromiseForm ? <X size={14} /> : <PlusCircle size={14} />}
                                {showPromiseForm ? "Close" : "Add Promise"}
                            </button>
                        </div>

                        {showPromiseForm && (
                            <div className="border p-3 rounded space-y-2 bg-gray-50">
                                <select
                                    className="w-full border p-2 rounded"
                                    value={promiseForm.type}
                                    onChange={(e) =>
                                        setPromiseForm({
                                            ...promiseForm,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="replacement">Replacement</option>
                                    <option value="discount">Discount</option>
                                    <option value="delivery">Delivery</option>
                                </select>

                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={promiseForm.dueDate}
                                    onChange={(e) =>
                                        setPromiseForm({
                                            ...promiseForm,
                                            dueDate: e.target.value,
                                        })
                                    }
                                />

                                <textarea
                                    className="w-full border p-2 rounded"
                                    placeholder="Notes"
                                    value={promiseForm.notes}
                                    onChange={(e) =>
                                        setPromiseForm({
                                            ...promiseForm,
                                            notes: e.target.value,
                                        })
                                    }
                                />

                                <button
                                    onClick={createPromise}
                                    className="w-full bg-[var(--background-card)] border border-[var(--sidebar-border)] text-black  py-2 rounded "
                                >
                                    Save Promise
                                </button>
                            </div>
                        )}

                        {promises.length === 0 ? (
                            <div className="text-sm text-gray-500">No promises found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border rounded-lg overflow-hidden">
                                    <thead className="bg-[var(--background-card)] border-b border-[var(--sidebar-border)]">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Type</th>
                                            <th className="px-3 py-2 text-left">Status</th>
                                            <th className="px-3 py-2 text-left">Due Date</th>
                                            <th className="px-3 py-2 text-left">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promises.map((p) => (
                                            <tr key={p._id} className="border-t">
                                                <td className="px-3 py-2 font-medium">
                                                    {p.type.toUpperCase()}
                                                </td>

                                                <td className="px-3 py-1">
                                                    <span
                                                       className={`px-2 py-1 rounded text-xs font-medium
  ${p.status === "fulfilled"
    ? "bg-[var(--accent-green)] text-black dark:bg-[var(--accent-green)] dark:text-green-200"
    : p.status === "breached"
    ? "bg-red-900 text-black dark:bg-red-100 dark:text-red-200"
    : "bg-yellow-900 text-black dark:bg-yellow-100 dark:text-yellow-200"
  }`
}

                                                    >
                                                        {p.status.toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-2">
                                                    {new Date(p.dueDate).toLocaleDateString()}
                                                </td>

                                                <td className="px-3 py-2 text-gray-400">
                                                    {p.notes || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                    {/* ================= CRM ACTIVITY NOTES ================= */}
                    <div className="border rounded-xl p-4 space-y-3">
                        <h2 className="font-semibold flex items-center gap-2">
                            <FileText size={18} /> CRM Activity Notes
                        </h2>

                        {/* ✅ CREATE NOTE */}
                        <div className="flex flex-col gap-2">
                            <textarea
                                className="w-full border p-2 rounded bg-[var(--background-card)] border-[var(--sidebar-border)] text-sm"
                                placeholder="Write internal CRM note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={3}
                            />

                            <button
                                onClick={createNote}
                                disabled={savingNote}
                                className="self-end px-4 py-2 rounded bg-[var(--background-card)] gap-1 border border-[var(--sidebar-border)] text-black text-sm"
                            >
                                {savingNote ? "Saving..." : "Add Note"}
                            </button>
                        </div>

                        {/* ✅ NOTES LIST */}
                        {notes.length === 0 ? (
                            <div className="text-sm text-gray-500">No internal notes yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {notes.map((note) => (
                                    <div
                                        key={note._id}
                                        className="border p-2 rounded bg-[var(--background-card)] border-[var(--sidebar-border)] text-sm"
                                    >
                                        <div className="text-gray-800 dark:text-gray-100">
                                            {note.message}
                                        </div>

                                        <div className="text-xs text-gray-400 mt-1 flex justify-between">
                                            <span>
                                                {note.createdBy ? `By ${note.createdBy}` : "By Admin"}
                                            </span>
                                            <span>
                                                {new Date(note.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* ================= DISPUTE GUARDRAILS ================= */}
                    <div className="border rounded-xl p-4 space-y-3">
                        <h2 className="font-semibold flex items-center gap-2 text-red-600">
                            <ShieldAlert size={18} /> Dispute Guardrails
                        </h2>

                        {guardrailBlocked && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                ⚠️ Refund blocked due to unresolved promises.
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={refundOverride}
                                onChange={(e) => setRefundOverride(e.target.checked)}
                            />
                            <span className="text-sm">Admin Override</span>
                        </div>

                        <button
                            onClick={attemptRefund}
                            className="px-4 py-2 rounded bg-[var(--background-card)] gap-1 text-black border border-[var(--sidebar-border)]"
                        >
                            Attempt Refund / Discount
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
