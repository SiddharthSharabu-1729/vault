
'use client';

import React, { useState, useEffect } from 'react';
import type { VaultEntry, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Editor } from '@/components/editor';
import { PlusCircle, Save, Trash2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '../ui/skeleton';

interface NotesViewProps {
    notes: VaultEntry[];
    categories: Category[];
    onAddEntry: (newEntry: Omit<VaultEntry, 'id'>, masterPassword: string) => void;
    onUpdateEntry: (updatedEntry: VaultEntry) => void;
    onDeleteEntry: (id: string, title: string, type: string) => void;
    activeCategorySlug?: string;
}

export function NotesView({ notes, categories, onAddEntry, onUpdateEntry, onDeleteEntry, activeCategorySlug }: NotesViewProps) {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [activeNote, setActiveNote] = useState<VaultEntry | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [editorTitle, setEditorTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();

    // Effect to update active note when selection or notes list changes
    useEffect(() => {
        if (selectedNoteId) {
            const note = notes.find(n => n.id === selectedNoteId);
            setActiveNote(note || null);
            setEditorContent(note?.notes || '');
            setEditorTitle(note?.title || '');
        } else {
            setActiveNote(null);
            setEditorContent('');
            setEditorTitle('');
        }
    }, [selectedNoteId, notes]);

    // Select the first note by default if one exists
    useEffect(() => {
        if (!selectedNoteId && notes.length > 0) {
            setSelectedNoteId(notes[0].id);
        } else if (notes.length === 0) {
            setSelectedNoteId(null);
        }
    }, [notes, selectedNoteId]);


    const handleSelectNote = (noteId: string) => {
        setSelectedNoteId(noteId);
    };

    const handleNewNote = () => {
        const defaultCategory = activeCategorySlug ?? (categories[0]?.slug || 'personal');
        
        // This is a dummy note object. The ID will be assigned by Firestore.
        // It won't use master password for encryption as notes are not encrypted.
        const newNote: Omit<VaultEntry, 'id'> = {
            type: 'note',
            title: 'New Note',
            category: defaultCategory,
            icon: 'StickyNote',
            notes: '<p>Start writing your new note here...</p>',
        };
        
        // Use a dummy password as it's required by the function signature, but notes are unencrypted.
        onAddEntry(newNote, 'DUMMY_PASSWORD'); 

        // Optimistically set the view to a new note state while waiting for DB update
        setActiveNote(null); // Clear out old active note
        setEditorTitle('New Note');
        setEditorContent('<p>Start writing your new note here...</p>');
        // We don't set a selectedId because the new note doesn't have one yet.
        // The useEffect will pick up the new note from the props and select it once it's added.
    };

    const handleSaveNote = async () => {
        if (!activeNote) {
            toast({
                variant: 'destructive',
                title: 'No note selected',
                description: 'Please select or create a note to save.',
            });
            return;
        }

        if (!editorTitle.trim()) {
            toast({
                variant: 'destructive',
                title: 'Title is required',
                description: 'Please provide a title for your note.',
            });
            return;
        }

        setIsSaving(true);
        const updatedNote = {
            ...activeNote,
            title: editorTitle,
            notes: editorContent,
        };
        
        try {
            await onUpdateEntry(updatedNote);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteNote = () => {
        if (!activeNote) return;
        onDeleteEntry(activeNote.id, activeNote.title, 'note');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[60vh]">
            {/* Editor Pane */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col border rounded-lg p-4">
                {selectedNoteId || notes.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                           <input
                                type="text"
                                value={editorTitle}
                                onChange={(e) => setEditorTitle(e.target.value)}
                                placeholder="Note Title"
                                className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                           />
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSaveNote} disabled={isSaving || !activeNote}>
                                    {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={!activeNote}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete &quot;{activeNote?.title}&quot;?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete this note.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <div className="flex-grow">
                             <Editor
                                content={editorContent}
                                onChange={setEditorContent}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-muted-foreground mb-4">You have no notes in this category.</p>
                        <Button onClick={handleNewNote}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Note
                        </Button>
                    </div>
                )}
            </div>

            {/* Note List Pane */}
            <div className="md:col-span-1 lg:col-span-1 border rounded-lg">
                <div className="p-4 border-b">
                    <Button onClick={handleNewNote} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                </div>
                <ScrollArea className="h-[55vh]">
                    <div className="p-2">
                        {notes.length > 0 ? (
                            notes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => handleSelectNote(note.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                                        selectedNoteId === note.id ? "bg-muted" : "hover:bg-muted/50"
                                    )}
                                >
                                    <h4 className="font-semibold truncate">{note.title}</h4>
                                    <p className="text-xs text-muted-foreground truncate"
                                      dangerouslySetInnerHTML={{ __html: note.notes?.replace(/<[^>]+>/g, ' ').substring(0, 100) || 'No content...' }}
                                    />
                                </button>
                            ))
                        ) : (
                           <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">No notes here.</p>
                           </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
