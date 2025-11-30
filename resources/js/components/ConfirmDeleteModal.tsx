import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
       isOpen: boolean;
       onClose: () => void;
       onConfirm: () => void;
       title: string;
       message: string;
       itemName: string;
       isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
       isOpen,
       onClose,
       onConfirm,
       title,
       message,
       itemName,
       isDeleting = false
}: ConfirmDeleteModalProps) {
       if (!isOpen) return null;

       return (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                     <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div
                                   className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
                                   onClick={onClose}
                            ></div>

                            {/* Center the modal */}
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                                   &#8203;
                            </span>

                            {/* Modal panel */}
                            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                   <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                          <div className="sm:flex sm:items-start">
                                                 {/* Icon */}
                                                 <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                 </div>

                                                 {/* Content */}
                                                 <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                                        <div className="flex items-center justify-between">
                                                               <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                                                      {title}
                                                               </h3>
                                                               <button
                                                                      onClick={onClose}
                                                                      disabled={isDeleting}
                                                                      className="ml-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                                                               >
                                                                      <X className="h-5 w-5" />
                                                               </button>
                                                        </div>

                                                        <div className="mt-2">
                                                               <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                      {message}
                                                               </p>
                                                               <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                             {itemName}
                                                                      </p>
                                                               </div>
                                                               <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                                                      ⚠️ Esta acción no se puede deshacer
                                                               </p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Buttons */}
                                   <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                          <button
                                                 type="button"
                                                 onClick={onConfirm}
                                                 disabled={isDeleting}
                                                 className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-700 sm:ml-3 sm:w-auto sm:text-sm ${isDeleting
                                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                                                        }`}
                                          >
                                                 {isDeleting ? (
                                                        <div className="flex items-center">
                                                               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                               </svg>
                                                               Eliminando...
                                                        </div>
                                                 ) : (
                                                        'Eliminar'
                                                 )}
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={onClose}
                                                 disabled={isDeleting}
                                                 className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                 Cancelar
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}