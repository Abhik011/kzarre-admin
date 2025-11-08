'use client';

import React, { useState } from 'react';
import { MoreVertical, Plus, X } from 'lucide-react';

const usersData = [
  { id: 1, name: 'Abhijeet kulkarni', email: 'abhijeetkulkarni.work@outlook.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'PM' },
  { id: 2, name: 'Harshit Jhawar', email: 'harshitjwr.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'Editor' },
  { id: 3, name: 'Harshal Pawar', email: 'harshalpawar.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'Support' },
  { id: 4, name: 'Rahul Jagdale', email: 'rahuljagdale.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'Admin' },
  { id: 5, name: 'Chinmay Kambale', email: 'chinmayk.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'CE' },
  { id: 6, name: 'Jeesi gems', email: 'jeesigms.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'AR' },
  { id: 7, name: 'Jasmit k', email: 'jasmitk.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'ACSR' },
  { id: 8, name: 'Rohit dere', email: 'rohitdere.work@gmail.com', status: 'Active', lastLogin: 'Jan 10, 2024', role: 'AMS' },
];

const activityData = [
  { id: 1, timestamp: '2025-01-18 10:30:15', user: 'Abhijeet kulkarni', action: 'Edited Title', details: 'Old Title to New title page1', ip: '192.168.1.5' },
  { id: 2, timestamp: '2025-01-18 10:30:15', user: 'Abhijeet kulkarni', action: 'Edited Title', details: 'Old Title to New title page1', ip: '192.168.1.5' },
  { id: 3, timestamp: '2025-01-18 10:30:15', user: 'Abhijeet kulkarni', action: 'Edited Title', details: 'Old Title to New title page1', ip: '192.168.1.5' },
  { id: 4, timestamp: '2025-01-18 10:30:15', user: 'Abhijeet kulkarni', action: 'Edited Title', details: 'Old Title to New title page1', ip: '192.168.1.5' },
  { id: 5, timestamp: '2025-01-18 10:30:15', user: 'Abhijeet kulkarni', action: 'Edited Title', details: 'Old Title to New title page1', ip: '192.168.1.5' },
];

const rolesData = [
  { id: 1, role: 'Admin', description: 'Full access to all models', assigned: 4 },
  { id: 2, role: 'Editor', description: 'Can add/update content, no deletion', assigned: 12 },
  { id: 3, role: 'Support', description: 'Can view / manage tickets & users', assigned: 7 },
  { id: 4, role: 'Customer', description: 'End-user with restricted access', assigned: 240 },
];

const permissions = ['Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1', 'Permission1'];

const rolesList = ['Admin', 'Editor', 'Support', 'Customer', 'PM', 'CE', 'AR', 'ACSR', 'AMS'];

const UserList = () => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <h3 className="text-lg font-bold text-gray-900 mb-2">User List</h3>
    <p className="text-sm text-gray-600 mb-4 sm:mb-6">Showing all users</p>
    
    {/* Mobile Card View */}
    <div className="sm:hidden space-y-4">
      {usersData.map((user) => (
        <div key={user.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">{user.name.charAt(0)}</div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            <button className="text-gray-500 hover:text-gray-700 flex-shrink-0"><MoreVertical size={18} /></button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><span className="w-1.5 h-1.5 bg-green-600 rounded-full inline-block mr-1"></span>{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Login:</span>
              <span className="font-medium">{user.lastLogin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium">{user.role}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Table View */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden lg:table-cell">Last Login</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden xl:table-cell">Role</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">{user.name.charAt(0)}</div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell truncate">{user.email}</td>
              <td className="px-4 py-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>{user.status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">{user.lastLogin}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900 hidden xl:table-cell">{user.role}</td>
              <td className="px-4 py-4">
                <button className="text-gray-500 hover:text-gray-700"><MoreVertical size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActivityLog = () => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Log</h3>
    <p className="text-sm text-gray-600 mb-4 sm:mb-6">Showing all users</p>
    
    {/* Mobile Card View */}
    <div className="sm:hidden space-y-4">
      {activityData.map((activity) => (
        <div key={activity.id} className="border border-gray-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-gray-900 mb-2">{activity.action}</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div><span className="font-medium">Time:</span> {activity.timestamp}</div>
            <div><span className="font-medium">User:</span> {activity.user}</div>
            <div><span className="font-medium">Details:</span> {activity.details}</div>
            <div><span className="font-medium">IP:</span> {activity.ip}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Table View */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">TimeStamp</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Details</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden lg:table-cell">IP address</th>
          </tr>
        </thead>
        <tbody>
          {activityData.map((activity) => (
            <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-600">{activity.timestamp}</td>
              <td className="px-4 py-4 text-sm text-gray-900 font-medium">{activity.user}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{activity.action}</td>
              <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{activity.details}</td>
              <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">{activity.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RolesPermissions = ({ onAddRoleClick }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Roles & Permissions</h3>
        <p className="text-sm text-gray-600">Manage user roles</p>
      </div>
      <button onClick={onAddRoleClick} className="w-full sm:w-auto px-4 py-2 bg-[#A0EDA8] text-black rounded-lg hover:bg-[#A0EDA8] hover:scale-105 hover:bg-green-500 flex items-center justify-center gap-2 font-medium text-sm">
        <Plus size={18} />Add Role
      </button>
    </div>

    {/* Mobile Card View */}
    <div className="sm:hidden space-y-4">
      {rolesData.map((role) => (
        <div key={role.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">{role.role}</h4>
            <button className="text-gray-500 hover:text-gray-700"><MoreVertical size={18} /></button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{role.description}</p>
          <p className="text-sm font-medium text-gray-900">Assigned: <span className="text-green-600">{role.assigned}</span></p>
        </div>
      ))}
    </div>

    {/* Table View */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">User Assigned</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rolesData.map((role) => (
            <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{role.role}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{role.description}</td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{role.assigned}</td>
              <td className="px-4 py-4">
                <button className="text-gray-500 hover:text-gray-700"><MoreVertical size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AddUserModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    status: 'Active',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New user data:', formData);
    // Here you would typically send this data to your backend
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      status: 'Active',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add User</h2>
              <p className="text-gray-600 text-sm mt-1">Create a new user account</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="">Select a role</option>
                  {rolesList.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> A temporary password will be sent to the user's email address.
              </p>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddRoleModal = ({ isOpen, onClose }) => {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Roles</h2>
          <p className="text-gray-600 text-sm mb-6">Define describe the role's responsibilities</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Role Name</label>
                <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm" placeholder="Enter role name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Role Description</label>
                <input type="text" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm" placeholder="Enter role description" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {permissions.map((permission, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPermissions[permission + index] || false} onChange={() => handlePermissionChange(permission + index)} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500" />
                    <span className="text-xs sm:text-sm text-gray-600">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">Create Role</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('userList');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and control system users</p>
      </div>

      {/* Content Container */}
      <div>
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mb-6">
              <div className="flex gap-4 sm:gap-8 border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
                <button onClick={() => setActiveTab('userList')} className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'userList' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-600 hover:text-gray-900'}`}>User List</button>
                <button onClick={() => setActiveTab('rolesPermissions')} className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'rolesPermissions' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-600 hover:text-gray-900'}`}>Roles & Permissions</button>
                <button onClick={() => setActiveTab('activityLog')} className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'activityLog' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-600 hover:text-gray-900'}`}>Activity Log</button>
              </div>

          {activeTab === 'userList' && (
            <button onClick={() => setIsAddUserModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-[#A0EDA8] text-black rounded-lg hover:bg-green-500 hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm">
              <Plus size={18} />Add User
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'userList' && <UserList />}
        {activeTab === 'rolesPermissions' && <RolesPermissions onAddRoleClick={() => setIsAddRoleModalOpen(true)} />}
        {activeTab === 'activityLog' && <ActivityLog />}

        {/* Add User Modal */}
        <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />

        {/* Add Role Modal */}
        <AddRoleModal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} />
      </div>
    </div>
  );
}