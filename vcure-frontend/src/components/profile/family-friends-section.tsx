"use client";

import { useState } from "react";
import { Users, ShieldCheck, Heart, AlertCircle, Lock, Eye, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamilyStore, type FamilyMember, type FamilyRelationship } from "@/store/family-store";
import { evaluateMemberObservations } from "@/lib/family-health-alerts";

export function FamilyFriendsSection() {
  const members = useFamilyStore((state) => state.members);
  const addMember = useFamilyStore((state) => state.addMember);
  const updatePermissions = useFamilyStore((state) => state.updatePermissions);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState<FamilyRelationship>("Dad");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addMember(newName, newRelationship);
    setNewName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Family & Friends Health
          </h2>
          <p className="text-xs font-medium text-gray-500">
            Monitor & support family members with explicit consent
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Member
        </Button>
      </div>

      {/* Member Cards Grid */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center space-y-2 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No family connections yet</h3>
            <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
              Connect with family members or friends to monitor health metrics and share wellness progress with explicit consent.
            </p>
            <Button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Family Member
            </Button>
          </div>
        ) : (
          members.map((member) => {
            const observations = evaluateMemberObservations(member);
          const isConnected = member.status === "CONNECTED";

          return (
            <div
              key={member.id}
              className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-sm border border-emerald-100">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                    <p className="text-[11px] font-semibold text-gray-400">{member.relationship}</p>
                  </div>
                </div>

                {isConnected ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">
                    Pending Invite
                  </span>
                )}
              </div>

              {/* Shared Permitted Metrics Pills */}
              {isConnected && member.healthData ? (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {member.permissions.shareGlucose && member.healthData.bloodGlucoseMgDl ? (
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                      Glucose: {member.healthData.bloodGlucoseMgDl} mg/dL
                    </span>
                  ) : null}
                  {member.permissions.shareBP && member.healthData.systolicBP ? (
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                      BP: {member.healthData.systolicBP}/{member.healthData.diastolicBP}
                    </span>
                  ) : null}
                  {member.permissions.shareWeight && member.healthData.bmi ? (
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                      BMI: {member.healthData.bmi}
                    </span>
                  ) : null}
                  {member.permissions.shareWater && member.healthData.waterMl ? (
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Water: {member.healthData.waterMl}ml
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* Observation Alerts Preview */}
              {observations.length > 0 && observations[0] ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    {observations[0].title}
                  </p>
                  <p className="text-[10px] font-medium leading-relaxed">{observations[0].message}</p>
                </div>
              ) : null}

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View & manage permissions
                </button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Member Details & Consent Drawer / Modal */}
      {selectedMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{selectedMember.name}'s Profile</h3>
                <p className="text-xs text-gray-500 font-medium">Relationship: {selectedMember.relationship}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {/* Consent Permissions Toggle */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                Explicit Data Sharing Consent
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">
                Health information is shared only when explicitly authorized by the data owner.
              </p>

              <div className="space-y-2 pt-1">
                {Object.entries(selectedMember.permissions).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs font-semibold text-gray-800">
                    <span className="capitalize">{key.replace("share", "Share ")}</span>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) =>
                        updatePermissions(selectedMember.id, { [key]: e.target.checked })
                      }
                      className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Consented Shared Metrics Display */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Consented Health Information
              </h4>
              {selectedMember.healthData ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedMember.permissions.shareWater ? (
                    <div className="rounded-xl bg-emerald-50 p-2.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Water Intake</span>
                      <span className="font-extrabold text-emerald-900">{selectedMember.healthData.waterMl || 0} / {selectedMember.healthData.waterGoalMl} ml</span>
                    </div>
                  ) : null}

                  {selectedMember.permissions.shareMeals ? (
                    <div className="rounded-xl bg-emerald-50 p-2.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Meals Eaten</span>
                      <span className="font-extrabold text-emerald-900">{selectedMember.healthData.mealsEatenCount || 0} meals</span>
                    </div>
                  ) : null}

                  {selectedMember.permissions.shareGlucose ? (
                    <div className="rounded-xl bg-gray-100 p-2.5">
                      <span className="text-[10px] font-bold text-gray-600 uppercase block">Blood Glucose</span>
                      <span className="font-extrabold text-gray-900">{selectedMember.healthData.bloodGlucoseMgDl || "N/A"} mg/dL</span>
                    </div>
                  ) : null}

                  {selectedMember.permissions.shareBP ? (
                    <div className="rounded-xl bg-gray-100 p-2.5">
                      <span className="text-[10px] font-bold text-gray-600 uppercase block">Blood Pressure</span>
                      <span className="font-extrabold text-gray-900">{selectedMember.healthData.systolicBP || "N/A"}/{selectedMember.healthData.diastolicBP || "N/A"}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs font-medium text-gray-400">Waiting for user to accept connection.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Member Modal */}
      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddSubmit} className="w-full max-w-md rounded-3xl bg-white p-5 space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">Add Family Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700">Member Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sister, Uncle"
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Relationship</label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value as FamilyRelationship)}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Dad">Dad</option>
                  <option value="Mom">Mom</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <Button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                Send Invite
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
