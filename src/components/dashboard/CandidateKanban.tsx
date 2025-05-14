
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Candidate = {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  score?: number;
};

type Stage = {
  id: string;
  title: string;
  candidates: Candidate[];
};

const initialStages: Stage[] = [
  {
    id: "screening",
    title: "Screening",
    candidates: [
      { 
        id: "c1", 
        name: "Alex Johnson", 
        position: "Full Stack Developer", 
        avatar: undefined, 
        score: 85 
      },
      { 
        id: "c2", 
        name: "Maria Rodriguez", 
        position: "UI/UX Designer", 
        avatar: undefined, 
        score: 92 
      },
    ]
  },
  {
    id: "interview",
    title: "Interview",
    candidates: [
      { 
        id: "c3", 
        name: "James Wilson", 
        position: "Product Manager", 
        avatar: undefined, 
        score: 78 
      },
    ]
  },
  {
    id: "assessment",
    title: "Assessment",
    candidates: [
      { 
        id: "c4", 
        name: "Sarah Kim", 
        position: "Data Scientist", 
        avatar: undefined, 
        score: 94 
      },
    ]
  },
  {
    id: "offer",
    title: "Offer",
    candidates: []
  }
];

export default function CandidateKanban() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [dragging, setDragging] = useState<Candidate | null>(null);
  const draggedStageId = useRef<string | null>(null);

  const handleDragStart = (candidate: Candidate, stageId: string) => {
    setDragging(candidate);
    draggedStageId.current = stageId;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!dragging || stageId === draggedStageId.current) return;

    setStages(prevStages => {
      // Remove from source
      const newStages = prevStages.map(stage => {
        if (stage.id === draggedStageId.current) {
          return {
            ...stage,
            candidates: stage.candidates.filter(c => c.id !== dragging.id)
          };
        }
        return stage;
      });

      // Add to destination
      return newStages.map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            candidates: [...stage.candidates, dragging]
          };
        }
        return stage;
      });
    });

    setDragging(null);
    draggedStageId.current = null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {stages.map(stage => (
        <div 
          key={stage.id} 
          className="min-h-[200px]"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(stage.id)}
        >
          <Card className="h-full">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
                <div className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                  {stage.candidates.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 py-2 space-y-2">
              {stage.candidates.map(candidate => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={() => handleDragStart(candidate, stage.id)}
                  className="bg-white p-3 rounded-md border border-gray-200 cursor-move hover:border-primary-300 hover:shadow-sm"
                >
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback className="bg-primary-100 text-primary-600 text-xs">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <p className="text-xs text-gray-500 truncate">{candidate.position}</p>
                      {candidate.score && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-primary-500" 
                              style={{ width: `${candidate.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">Match: {candidate.score}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {stage.candidates.length === 0 && (
                <div className="h-20 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Drop candidates here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
