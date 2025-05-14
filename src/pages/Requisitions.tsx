
import Layout from "@/components/layout/Layout";
import RequisitionForm from "@/components/requisitions/RequisitionForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Requisitions = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Requisitions</h1>
          <p className="text-gray-500">Manage your job openings</p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "View Requisitions" : "Create Requisition"}
        </Button>
      </div>
      
      {showForm ? (
        <RequisitionForm />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Create your first job requisition to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                Create Requisition
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Requisitions;
