import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/admin/data-table";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type Agent = {
  id: string;
  email: string;
  role: 'agent' | 'hotel_admin' | 'regional_admin' | 'global_admin';
  agency_id?: string;
  first_name?: string;
  last_name?: string;
  telephone?: string;
  created_at: string;
  updated_at: string;
  agency?: {
    id: string;
    name: string;
    code: string;
  };
};

const columnHelper = createColumnHelper<Agent>();

const columns: ColumnDef<Agent>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <a
        className="text-primary underline"
        href={`/admin/agents/${info.getValue()}`}
      >
        {info.getValue().slice(0, 8)}...
      </a>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("first_name", {
    header: "First Name",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("last_name", {
    header: "Last Name",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => {
      const role = info.getValue();
      const roleDisplay = {
        agent: "Agent",
        hotel_admin: "Hotel Admin",
        regional_admin: "Regional Admin",
        global_admin: "Global Admin"
      }[role] || role;
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role === 'global_admin' ? 'bg-red-100 text-red-800' :
          role === 'regional_admin' ? 'bg-green-100 text-green-800' :
          role === 'hotel_admin' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {roleDisplay}
        </span>
      );
    },
  }),
  columnHelper.accessor("agency.name", {
    header: "Agency",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("telephone", {
    header: "Phone",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

interface DataTableProps {
  data: Agent[];
}

export function AgentsTable({ data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <DataTable table={table} />
    </div>
  );
}